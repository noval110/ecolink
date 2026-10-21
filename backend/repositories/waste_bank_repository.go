package repositories

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type WasteBank struct {
	ID          int64    `json:"id"`
	Name        string   `json:"name"`
	Address     *string  `json:"address,omitempty"`
	Latitude    *float64 `json:"latitude,omitempty"`
	Longitude   *float64 `json:"longitude,omitempty"`
	Phone       *string  `json:"phone,omitempty"`
	Description *string  `json:"description,omitempty"`
	Status      *string  `json:"status,omitempty"`
}

type WasteBankPrice struct {
	WasteCategoryID int64   `json:"waste_category_id"`
	Name            string  `json:"name"`
	Unit            *string `json:"unit,omitempty"`
	PricePerKg      float64 `json:"price_per_kg"`
}

type WasteBankRepository struct {
	db *pgxpool.Pool
}

func NewWasteBankRepository(
	db *pgxpool.Pool,
) *WasteBankRepository {
	return &WasteBankRepository{
		db: db,
	}
}

func (r *WasteBankRepository) List(
	ctx context.Context,
) ([]WasteBank, error) {
	rows, err := r.db.Query(
		ctx,
		`
		SELECT
			id,
			name,
			address,
			latitude,
			longitude,
			phone,
			description,
			status
		FROM waste_banks
		ORDER BY id
		`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	wasteBanks := make([]WasteBank, 0)

	for rows.Next() {
		var wasteBank WasteBank

		err := rows.Scan(
			&wasteBank.ID,
			&wasteBank.Name,
			&wasteBank.Address,
			&wasteBank.Latitude,
			&wasteBank.Longitude,
			&wasteBank.Phone,
			&wasteBank.Description,
			&wasteBank.Status,
		)
		if err != nil {
			return nil, err
		}

		wasteBanks = append(wasteBanks, wasteBank)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return wasteBanks, nil
}

func (r *WasteBankRepository) GetByID(
	ctx context.Context,
	id int64,
) (*WasteBank, error) {
	wasteBank := &WasteBank{}

	err := r.db.QueryRow(
		ctx,
		`
		SELECT
			id,
			name,
			address,
			latitude,
			longitude,
			phone,
			description,
			status
		FROM waste_banks
		WHERE id = $1
		`,
		id,
	).Scan(
		&wasteBank.ID,
		&wasteBank.Name,
		&wasteBank.Address,
		&wasteBank.Latitude,
		&wasteBank.Longitude,
		&wasteBank.Phone,
		&wasteBank.Description,
		&wasteBank.Status,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}

	return wasteBank, nil
}

func (r *WasteBankRepository) GetPrices(
	ctx context.Context,
	wasteBankID int64,
) ([]WasteBankPrice, error) {
	rows, err := r.db.Query(
		ctx,
		`
		SELECT
			wc.id,
			wc.name,
			wc.unit,
			wp.price_per_kg
		FROM waste_prices wp
		JOIN waste_categories wc
			ON wc.id = wp.category_id
		WHERE wp.waste_bank_id = $1
		  AND (
			  wp.effective_to IS NULL
			  OR wp.effective_to >= CURRENT_DATE
		  )
		ORDER BY wc.id
		`,
		wasteBankID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	prices := make([]WasteBankPrice, 0)

	for rows.Next() {
		var price WasteBankPrice

		err := rows.Scan(
			&price.WasteCategoryID,
			&price.Name,
			&price.Unit,
			&price.PricePerKg,
		)
		if err != nil {
			return nil, err
		}

		prices = append(prices, price)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return prices, nil
}