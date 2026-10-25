package repositories

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/noval110/ecolink/backend/models"
)

type AuthRepository struct {
	db *pgxpool.Pool
}

func NewAuthRepository(db *pgxpool.Pool) *AuthRepository {
	return &AuthRepository{
		db: db,
	}
}

func (r *AuthRepository) GetRoleIDByName(
	ctx context.Context,
	roleName string,
) (int64, error) {
	var roleID int64

	err := r.db.QueryRow(
		ctx,
		`SELECT id
		 FROM roles
		 WHERE LOWER(name) = LOWER($1)
		 LIMIT 1`,
		roleName,
	).Scan(&roleID)

	return roleID, err
}

func (r *AuthRepository) GetUserByEmail(
	ctx context.Context,
	email string,
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
		WHERE LOWER(u.email) = LOWER($1)
		LIMIT 1
		`,
		email,
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

func (r *AuthRepository) CreateUser(
	ctx context.Context,
	roleID int64,
	email string,
	passwordHash string,
	fullName string,
) (*models.User, error) {
	user := &models.User{}

	err := r.db.QueryRow(
		ctx,
		`
		INSERT INTO users (
			role_id,
			email,
			password,
			full_name
		)
		VALUES ($1, LOWER($2), $3, $4)
		RETURNING
			id,
			role_id,
			email,
			password,
			full_name,
			phone,
			is_active,
			created_at
		`,
		roleID,
		email,
		passwordHash,
		fullName,
	).Scan(
		&user.ID,
		&user.RoleID,
		&user.Email,
		&user.Password,
		&user.FullName,
		&user.Phone,
		&user.IsActive,
		&user.CreatedAt,
	)

	if err != nil {
		return nil, err
	}

	return user, nil
}
