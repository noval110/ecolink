package repositories

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type PassportMaterial struct {
	CategoryID int64   `json:"category_id"`
	Name       string  `json:"name"`
	Weight     float64 `json:"weight"`
	Percentage float64 `json:"percentage"`
}

type PassportBadge struct {
	ID          int64      `json:"id"`
	Name        string     `json:"name"`
	Description *string    `json:"description,omitempty"`
	IconURL     *string    `json:"icon_url,omitempty"`
	Criteria    *string    `json:"criteria,omitempty"`
	EarnedAt    *time.Time `json:"earned_at,omitempty"`
}

type PassportData struct {
	PassportID string `json:"passport_id"`

	User struct {
		ID        int64     `json:"id"`
		FullName  string    `json:"full_name"`
		Email     string    `json:"email"`
		Role      string    `json:"role"`
		CreatedAt time.Time `json:"created_at"`
	} `json:"user"`

	Stats struct {
		TotalRecycled       float64 `json:"total_recycled"`
		CO2Avoided          float64 `json:"co2_avoided"`
		EcoScore            int     `json:"eco_score"`
		VerifiedTransactions int    `json:"verified_transactions"`
		TotalValue          float64 `json:"total_value"`
	} `json:"stats"`

	Materials []PassportMaterial `json:"materials"`
	Badges    []PassportBadge    `json:"badges"`
}

type PassportRepository struct {
	db *pgxpool.Pool
}

func NewPassportRepository(
	db *pgxpool.Pool,
) *PassportRepository {
	return &PassportRepository{
		db: db,
	}
}

func (r *PassportRepository) GetByUserID(
	ctx context.Context,
	userID int64,
) (*PassportData, error) {
	result := &PassportData{}

	err := r.db.QueryRow(
		ctx,
		`
		SELECT
			u.id,
			u.full_name,
			u.email,
			r.name,
			u.created_at
		FROM users u
		JOIN roles r
			ON r.id = u.role_id
		WHERE u.id = $1
		`,
		userID,
	).Scan(
		&result.User.ID,
		&result.User.FullName,
		&result.User.Email,
		&result.User.Role,
		&result.User.CreatedAt,
	)

	if err != nil {
		return nil, err
	}

	result.PassportID =
		fmt.Sprintf(
			"ECO-%06d",
			result.User.ID,
		)

	var totalWeight float64

	err = r.db.QueryRow(
		ctx,
		`
		SELECT
			COALESCE(SUM(total_weight), 0)::float8,
			COUNT(*)::int,
			COALESCE(SUM(total_value), 0)::float8
		FROM transactions
		WHERE user_id = $1
		  AND status = 'verified'
		`,
		userID,
	).Scan(
		&totalWeight,
		&result.Stats.VerifiedTransactions,
		&result.Stats.TotalValue,
	)

	if err != nil {
		return nil, err
	}

	result.Stats.TotalRecycled = totalWeight
	result.Stats.EcoScore =
		int(totalWeight * 10)

	result.Stats.CO2Avoided =
		float64(
			int(totalWeight*0.6*100+0.5),
		) / 100

	rows, err := r.db.Query(
		ctx,
		`
		SELECT
			wc.id,
			wc.name,
			COALESCE(SUM(ti.weight), 0)::float8
		FROM transaction_items ti
		JOIN transactions t
			ON t.id = ti.transaction_id
		JOIN waste_categories wc
			ON wc.id = ti.category_id
		WHERE t.user_id = $1
		  AND t.status = 'verified'
		GROUP BY wc.id, wc.name
		ORDER BY SUM(ti.weight) DESC
		`,
		userID,
	)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	result.Materials =
		make([]PassportMaterial, 0)

	for rows.Next() {
		var material PassportMaterial

		if err := rows.Scan(
			&material.CategoryID,
			&material.Name,
			&material.Weight,
		); err != nil {
			return nil, err
		}

		if totalWeight > 0 {
			material.Percentage =
				material.Weight /
					totalWeight * 100
		}

		result.Materials = append(
			result.Materials,
			material,
		)
	}

	badgeRows, err := r.db.Query(
		ctx,
		`
		SELECT
			b.id,
			b.name,
			b.description,
			b.icon_url,
			b.criteria,
			ub.earned_at
		FROM user_badges ub
		JOIN badges b
			ON b.id = ub.badge_id
		WHERE ub.user_id = $1
		ORDER BY ub.earned_at DESC
		`,
		userID,
	)

	if err != nil {
		return nil, err
	}

	defer badgeRows.Close()

	result.Badges =
		make([]PassportBadge, 0)

	for badgeRows.Next() {
		var badge PassportBadge

		if err := badgeRows.Scan(
			&badge.ID,
			&badge.Name,
			&badge.Description,
			&badge.IconURL,
			&badge.Criteria,
			&badge.EarnedAt,
		); err != nil {
			return nil, err
		}

		result.Badges = append(
			result.Badges,
			badge,
		)
	}

	return result, nil
}