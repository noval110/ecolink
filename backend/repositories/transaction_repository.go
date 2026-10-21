package repositories

import (
	"context"
	"errors"
	"math"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	ErrTransactionWasteBankNotFound = errors.New("waste bank not found")
	ErrTransactionCampaignNotFound  = errors.New("campaign not found")
	ErrTransactionNotJoinedCampaign = errors.New("user has not joined campaign")
	ErrTransactionCategoryNotAccepted = errors.New("waste category is not accepted")
)

type CreateTransactionItemInput struct {
	WasteCategoryID int64
	Weight          float64
}

type CreatedTransactionItem struct {
	WasteCategoryID   int64   `json:"waste_category_id"`
	WasteCategoryName string  `json:"waste_category_name"`
	Weight            float64 `json:"weight"`
	UnitPrice         float64 `json:"unit_price"`
	Subtotal          float64 `json:"subtotal"`
}

type CreatedTransaction struct {
	ID          int64                    `json:"transaction_id"`
	UserID      int64                    `json:"user_id"`
	WasteBankID int64                    `json:"waste_bank_id"`
	CampaignID  *int64                   `json:"campaign_id"`
	Status      string                   `json:"status"`
	TotalWeight float64                  `json:"total_weight"`
	TotalValue  float64                  `json:"total_value"`
	Items       []CreatedTransactionItem `json:"items"`
	CreatedAt   time.Time                `json:"created_at"`
}

type TransactionRepository struct {
	db *pgxpool.Pool
}

func NewTransactionRepository(
	db *pgxpool.Pool,
) *TransactionRepository {
	return &TransactionRepository{
		db: db,
	}
}

func (r *TransactionRepository) Create(
	ctx context.Context,
	userID int64,
	wasteBankID int64,
	campaignID *int64,
	items []CreateTransactionItemInput,
) (*CreatedTransaction, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	var wasteBankExists bool

	err = tx.QueryRow(
		ctx,
		`
		SELECT EXISTS (
			SELECT 1
			FROM waste_banks
			WHERE id = $1
		)
		`,
		wasteBankID,
	).Scan(&wasteBankExists)

	if err != nil {
		return nil, err
	}

	if !wasteBankExists {
		return nil, ErrTransactionWasteBankNotFound
	}

	if campaignID != nil {
		var campaignExists bool

		err = tx.QueryRow(
			ctx,
			`
			SELECT EXISTS (
				SELECT 1
				FROM campaigns
				WHERE id = $1
				  AND status = 'active'
			)
			`,
			*campaignID,
		).Scan(&campaignExists)

		if err != nil {
			return nil, err
		}

		if !campaignExists {
			return nil, ErrTransactionCampaignNotFound
		}

		var joined bool

		err = tx.QueryRow(
			ctx,
			`
			SELECT EXISTS (
				SELECT 1
				FROM campaigners
				WHERE campaign_id = $1
				  AND user_id = $2
				  AND status = 'joined'
			)
			`,
			*campaignID,
			userID,
		).Scan(&joined)

		if err != nil {
			return nil, err
		}

		if !joined {
			return nil, ErrTransactionNotJoinedCampaign
		}
	}

	resultItems := make(
		[]CreatedTransactionItem,
		0,
		len(items),
	)

	var totalWeight float64
	var totalValue float64

	for _, item := range items {
		var categoryName string
		var unitPrice float64

		err = tx.QueryRow(
			ctx,
			`
			SELECT
				wc.name,
				wp.price_per_kg::float8
			FROM waste_prices wp
			JOIN waste_categories wc
				ON wc.id = wp.category_id
			WHERE wp.waste_bank_id = $1
			  AND wp.category_id = $2
			  AND (
				  wp.effective_from IS NULL
				  OR wp.effective_from <= CURRENT_DATE
			  )
			  AND (
				  wp.effective_to IS NULL
				  OR wp.effective_to >= CURRENT_DATE
			  )
			ORDER BY
				wp.effective_from DESC NULLS LAST,
				wp.id DESC
			LIMIT 1
			`,
			wasteBankID,
			item.WasteCategoryID,
		).Scan(
			&categoryName,
			&unitPrice,
		)

		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrTransactionCategoryNotAccepted
		}

		if err != nil {
			return nil, err
		}

		subtotal :=
			math.Round(unitPrice*item.Weight*100) / 100

		totalWeight += item.Weight
		totalValue += subtotal

		resultItems = append(
			resultItems,
			CreatedTransactionItem{
				WasteCategoryID:   item.WasteCategoryID,
				WasteCategoryName: categoryName,
				Weight:            item.Weight,
				UnitPrice:         unitPrice,
				Subtotal:          subtotal,
			},
		)
	}

	totalWeight =
		math.Round(totalWeight*100) / 100

	totalValue =
		math.Round(totalValue*100) / 100

	result := &CreatedTransaction{
		UserID:      userID,
		WasteBankID: wasteBankID,
		CampaignID:  campaignID,
		Status:      "pending",
		TotalWeight: totalWeight,
		TotalValue:  totalValue,
		Items:       resultItems,
	}

	err = tx.QueryRow(
		ctx,
		`
		INSERT INTO transactions (
			user_id,
			waste_bank_id,
			campaign_id,
			total_weight,
			total_value,
			status
		)
		VALUES ($1, $2, $3, $4, $5, 'pending')
		RETURNING
			id,
			status,
			created_at
		`,
		userID,
		wasteBankID,
		campaignID,
		totalWeight,
		totalValue,
	).Scan(
		&result.ID,
		&result.Status,
		&result.CreatedAt,
	)

	if err != nil {
		return nil, err
	}

	for _, item := range resultItems {
		_, err = tx.Exec(
			ctx,
			`
			INSERT INTO transaction_items (
				transaction_id,
				category_id,
				weight,
				price_per_kg,
				subtotal
			)
			VALUES ($1, $2, $3, $4, $5)
			`,
			result.ID,
			item.WasteCategoryID,
			item.Weight,
			item.UnitPrice,
			item.Subtotal,
		)

		if err != nil {
			return nil, err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	return result, nil
}