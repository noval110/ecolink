package repositories

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/noval110/ecolink/backend/models"
)

type UserRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) *UserRepository {
	return &UserRepository{
		db: db,
	}
}

func (r *UserRepository) GetByID(
	ctx context.Context,
	userID int64,
) (*models.User, error) {
	user := &models.User{}

	err := r.db.QueryRow(
		ctx,
		`
		SELECT
			u.id,
			u.role_id,
			r.name,
			u.email,
			u.password,
			u.full_name,
			u.phone,
			u.is_active,
			u.created_at
		FROM users u
		JOIN roles r ON r.id = u.role_id
		WHERE u.id = $1
		LIMIT 1
		`,
		userID,
	).Scan(
		&user.ID,
		&user.RoleID,
		&user.Role,
		&user.Email,
		&user.Password,
		&user.FullName,
		&user.Phone,
		&user.IsActive,
		&user.CreatedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}

	return user, nil
}