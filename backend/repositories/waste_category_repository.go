package repositories

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type WasteCategory struct {
	ID          int64   `json:"id"`
	Name        string  `json:"name"`
	Description *string `json:"description,omitempty"`
	Unit        *string `json:"unit,omitempty"`
	IconURL     *string `json:"icon_url,omitempty"`
}

type WasteCategoryRepository struct {
	db *pgxpool.Pool
}

func NewWasteCategoryRepository(
	db *pgxpool.Pool,
) *WasteCategoryRepository {
	return &WasteCategoryRepository{
		db: db,
	}
}

func (r *WasteCategoryRepository) List(
	ctx context.Context,
) ([]WasteCategory, error) {
	rows, err := r.db.Query(
		ctx,
		`
		SELECT
			id,
			name,
			description,
			unit,
			icon_url
		FROM waste_categories
		ORDER BY id
		`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	categories := make([]WasteCategory, 0)

	for rows.Next() {
		var category WasteCategory

		err := rows.Scan(
			&category.ID,
			&category.Name,
			&category.Description,
			&category.Unit,
			&category.IconURL,
		)
		if err != nil {
			return nil, err
		}

		categories = append(categories, category)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return categories, nil
}