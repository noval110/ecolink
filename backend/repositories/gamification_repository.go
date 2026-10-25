package repositories

import (
	"context"
	"encoding/json"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type GamificationRepository struct {
	db *pgxpool.Pool
}

func NewGamificationRepository(
	db *pgxpool.Pool,
) *GamificationRepository {
	return &GamificationRepository{
		db: db,
	}
}

type userGamificationMetrics struct {
	RecycledWeight       float64
	VerifiedTransactions float64
	CampaignJoined       float64
}

type MissionItem struct {
	ID          int64   `json:"id"`
	Title       string  `json:"title"`
	Description *string `json:"description,omitempty"`
	Type        string  `json:"type"`
	TargetValue float64 `json:"target_value"`
	Progress    float64 `json:"progress"`
	Percentage  float64 `json:"percentage"`
	XPReward    int     `json:"xp_reward"`
	Status      string  `json:"status"`
}

type BadgeItem struct {
	ID          int64      `json:"id"`
	Name        string     `json:"name"`
	Description *string    `json:"description,omitempty"`
	IconURL     *string    `json:"icon_url,omitempty"`

	CriteriaType string  `json:"criteria_type"`
	Target       float64 `json:"target"`
	Progress     float64 `json:"progress"`
	Percentage   float64 `json:"percentage"`

	IsUnlocked bool       `json:"is_unlocked"`
	EarnedAt   *time.Time `json:"earned_at,omitempty"`
}

type badgeCriteria struct {
	Type   string  `json:"type"`
	Target float64 `json:"target"`
}

func (r *GamificationRepository) getMetrics(
	ctx context.Context,
	userID int64,
) (*userGamificationMetrics, error) {
	var metrics userGamificationMetrics

	err := r.db.QueryRow(
		ctx,
		`
		SELECT
			COALESCE(
				(
					SELECT SUM(total_weight)
					FROM transactions
					WHERE user_id = $1
					  AND status = 'verified'
				),
				0
			)::float8,

			(
				SELECT COUNT(*)
				FROM transactions
				WHERE user_id = $1
				  AND status = 'verified'
			)::float8,

			(
				SELECT COUNT(*)
				FROM campaigners
				WHERE user_id = $1
				  AND status = 'joined'
			)::float8
		`,
		userID,
	).Scan(
		&metrics.RecycledWeight,
		&metrics.VerifiedTransactions,
		&metrics.CampaignJoined,
	)

	if err != nil {
		return nil, err
	}

	return &metrics, nil
}

func progressForType(
	metrics *userGamificationMetrics,
	missionType string,
) float64 {
	switch missionType {

	case "recycle_weight":
		return metrics.RecycledWeight

	case "verified_transactions":
		return metrics.VerifiedTransactions

	case "campaign_joined":
		return metrics.CampaignJoined

	default:
		return 0
	}
}

func calculatePercentage(
	progress float64,
	target float64,
) float64 {
	if target <= 0 {
		return 0
	}

	result := progress / target * 100

	if result > 100 {
		return 100
	}

	return result
}

func (r *GamificationRepository) ListMissionsByUser(
	ctx context.Context,
	userID int64,
) ([]MissionItem, error) {

	metrics, err := r.getMetrics(
		ctx,
		userID,
	)

	if err != nil {
		return nil, err
	}

	rows, err := r.db.Query(
		ctx,
		`
		SELECT
			id,
			title,
			description,
			type,
			target_value::float8,
			xp_reward
		FROM missions
		WHERE is_active = TRUE
		ORDER BY id
		`,
	)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	missions := make(
		[]MissionItem,
		0,
	)

	for rows.Next() {
		var mission MissionItem

		if err := rows.Scan(
			&mission.ID,
			&mission.Title,
			&mission.Description,
			&mission.Type,
			&mission.TargetValue,
			&mission.XPReward,
		); err != nil {
			return nil, err
		}

		mission.Progress =
			progressForType(
				metrics,
				mission.Type,
			)

		mission.Percentage =
			calculatePercentage(
				mission.Progress,
				mission.TargetValue,
			)

		if mission.Progress >= mission.TargetValue {
			mission.Status = "completed"
		} else {
			mission.Status = "in_progress"
		}

		commandTag, err := r.db.Exec(
			ctx,
			`
			UPDATE user_missions
			SET
				progress = $3,
				status = $4,
				updated_at = CURRENT_TIMESTAMP
			WHERE user_id = $1
			  AND mission_id = $2
			`,
			userID,
			mission.ID,
			mission.Progress,
			mission.Status,
		)

		if err != nil {
			return nil, err
		}

		if commandTag.RowsAffected() == 0 {
			_, err = r.db.Exec(
				ctx,
				`
				INSERT INTO user_missions
				(
					user_id,
					mission_id,
					progress,
					status
				)
				VALUES ($1, $2, $3, $4)
				`,
				userID,
				mission.ID,
				mission.Progress,
				mission.Status,
			)

			if err != nil {
				return nil, err
			}
		}

		missions = append(
			missions,
			mission,
		)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return missions, nil
}

func (r *GamificationRepository) ListBadgesByUser(
	ctx context.Context,
	userID int64,
) ([]BadgeItem, error) {

	metrics, err := r.getMetrics(
		ctx,
		userID,
	)

	if err != nil {
		return nil, err
	}

	rows, err := r.db.Query(
		ctx,
		`
		SELECT
			id,
			name,
			description,
			icon_url,
			criteria
		FROM badges
		ORDER BY id
		`,
	)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	badges := make(
		[]BadgeItem,
		0,
	)

	for rows.Next() {

		var badge BadgeItem
		var rawCriteria *string

		if err := rows.Scan(
			&badge.ID,
			&badge.Name,
			&badge.Description,
			&badge.IconURL,
			&rawCriteria,
		); err != nil {
			return nil, err
		}

		var criteria badgeCriteria

		if rawCriteria != nil {
			_ = json.Unmarshal(
				[]byte(*rawCriteria),
				&criteria,
			)
		}

		badge.CriteriaType =
			criteria.Type

		badge.Target =
			criteria.Target

		badge.Progress =
			progressForType(
				metrics,
				criteria.Type,
			)

		badge.Percentage =
			calculatePercentage(
				badge.Progress,
				badge.Target,
			)

		if badge.Target > 0 &&
			badge.Progress >= badge.Target {

			_, err := r.db.Exec(
				ctx,
				`
				INSERT INTO user_badges
				(
					user_id,
					badge_id
				)
				SELECT $1, $2
				WHERE NOT EXISTS (
					SELECT 1
					FROM user_badges
					WHERE user_id = $1
					  AND badge_id = $2
				)
				`,
				userID,
				badge.ID,
			)

			if err != nil {
				return nil, err
			}
		}

		err = r.db.QueryRow(
			ctx,
			`
			SELECT
				MAX(earned_at)
			FROM user_badges
			WHERE user_id = $1
			  AND badge_id = $2
			`,
			userID,
			badge.ID,
		).Scan(
			&badge.EarnedAt,
		)

		if err != nil {
			return nil, err
		}

		badge.IsUnlocked =
			badge.EarnedAt != nil

		badges = append(
			badges,
			badge,
		)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return badges, nil
}