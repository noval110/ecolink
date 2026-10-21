package repositories

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type DashboardUser struct {
	ID       int64
	FullName string
	Role     string
}

type DashboardStats struct {
	TotalRecycled   float64
	VerifiedActions int
	CampaignJoined  int
	EcoScore        int
	CO2Avoided      float64
}

type DashboardRepository struct {
	db *pgxpool.Pool
}

func NewDashboardRepository(db *pgxpool.Pool) *DashboardRepository {
	return &DashboardRepository{
		db: db,
	}
}

func (r *DashboardRepository) GetUser(
	ctx context.Context,
	userID int64,
) (*DashboardUser, error) {
	user := &DashboardUser{}

	err := r.db.QueryRow(
		ctx,
		`
		SELECT
			u.id,
			u.full_name,
			r.name
		FROM users u
		JOIN roles r ON r.id = u.role_id
		WHERE u.id = $1
		`,
		userID,
	).Scan(
		&user.ID,
		&user.FullName,
		&user.Role,
	)

	if err != nil {
		return nil, err
	}

	return user, nil
}

func (r *DashboardRepository) GetStats(
	ctx context.Context,
	userID int64,
) (*DashboardStats, error) {
	stats := &DashboardStats{}

	err := r.db.QueryRow(
		ctx,
		`
		SELECT
			COALESCE(SUM(total_weight) FILTER (
				WHERE status = 'verified'
			), 0),

			COUNT(*) FILTER (
				WHERE status = 'verified'
			)
		FROM transactions
		WHERE user_id = $1
		`,
		userID,
	).Scan(
		&stats.TotalRecycled,
		&stats.VerifiedActions,
	)

	if err != nil {
		return nil, err
	}

	err = r.db.QueryRow(
		ctx,
		`
		SELECT COUNT(DISTINCT campaign_id)
		FROM campaigners
		WHERE user_id = $1
		`,
		userID,
	).Scan(&stats.CampaignJoined)

	if err != nil {
		return nil, err
	}

	stats.EcoScore = int(stats.TotalRecycled * 10)
	stats.CO2Avoided = stats.TotalRecycled * 0.6

	return stats, nil
}