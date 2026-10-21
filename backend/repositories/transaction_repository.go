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
	ErrTransactionWasteBankNotFound     = errors.New("waste bank not found")
	ErrTransactionCampaignNotFound      = errors.New("campaign not found")
	ErrTransactionNotJoinedCampaign     = errors.New("user has not joined campaign")
	ErrTransactionCategoryNotAccepted   = errors.New("waste category is not accepted")
	ErrTransactionNotFound              = errors.New("transaction not found")
	ErrTransactionAlreadyVerified       = errors.New("transaction already verified")
	ErrTransactionCannotVerify          = errors.New("transaction cannot be verified")
	ErrTransactionVerifierNotAuthorized = errors.New("verifier is not authorized for this waste bank")
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

type TransactionHistoryItem struct {
	ID          int64     `json:"id"`
	WasteBankID int64     `json:"waste_bank_id"`
	WasteBank   string    `json:"waste_bank"`
	CampaignID  *int64    `json:"campaign_id"`
	Campaign    *string   `json:"campaign,omitempty"`
	TotalWeight float64   `json:"total_weight"`
	TotalValue  float64   `json:"total_value"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
}

type TransactionDetail struct {
	ID          int64                    `json:"transaction_id"`
	UserID      int64                    `json:"user_id"`
	UserName    string                   `json:"user_name"`
	WasteBankID int64                    `json:"waste_bank_id"`
	WasteBank   string                   `json:"waste_bank"`
	CampaignID  *int64                   `json:"campaign_id"`
	Campaign    *string                  `json:"campaign,omitempty"`
	TotalWeight float64                  `json:"total_weight"`
	TotalValue  float64                  `json:"total_value"`
	Status      string                   `json:"status"`
	Items       []CreatedTransactionItem `json:"items"`
	CreatedAt   time.Time                `json:"created_at"`
}

type VerifiedTransaction struct {
	ID                    int64   `json:"transaction_id"`
	Status                string  `json:"status"`
	TotalWeight           float64 `json:"total_weight"`
	TotalValue            float64 `json:"total_value"`
	ImpactAdded           float64 `json:"impact_added"`
	EcoScoreAdded         int     `json:"eco_score_added"`
	CampaignProgressAdded float64 `json:"campaign_progress_added"`
}

func NewTransactionRepository(
	db *pgxpool.Pool,
) *TransactionRepository {
	return &TransactionRepository{
		db: db,
	}
}

func (r *TransactionRepository) ListByUser(
	ctx context.Context,
	userID int64,
	status string,
) ([]TransactionHistoryItem, error) {
	query := `
		SELECT
			t.id,
			t.waste_bank_id,
			wb.name,
			t.campaign_id,
			c.title,
			COALESCE(t.total_weight, 0)::float8,
			COALESCE(t.total_value, 0)::float8,
			t.status,
			t.created_at
		FROM transactions t
		JOIN waste_banks wb
			ON wb.id = t.waste_bank_id
		LEFT JOIN campaigns c
			ON c.id = t.campaign_id
		WHERE t.user_id = $1
	`

	args := []any{userID}

	if status != "" {
		query += ` AND t.status = $2`
		args = append(args, status)
	}

	query += ` ORDER BY t.created_at DESC`

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make([]TransactionHistoryItem, 0)

	for rows.Next() {
		var item TransactionHistoryItem

		if err := rows.Scan(
			&item.ID,
			&item.WasteBankID,
			&item.WasteBank,
			&item.CampaignID,
			&item.Campaign,
			&item.TotalWeight,
			&item.TotalValue,
			&item.Status,
			&item.CreatedAt,
		); err != nil {
			return nil, err
		}

		result = append(result, item)
	}

	return result, rows.Err()
}

func (r *TransactionRepository) GetByID(
	ctx context.Context,
	transactionID int64,
) (*TransactionDetail, error) {
	result := &TransactionDetail{}

	err := r.db.QueryRow(
		ctx,
		`
		SELECT
			t.id,
			t.user_id,
			u.full_name,
			t.waste_bank_id,
			wb.name,
			t.campaign_id,
			c.title,
			COALESCE(t.total_weight, 0)::float8,
			COALESCE(t.total_value, 0)::float8,
			t.status,
			t.created_at
		FROM transactions t
		JOIN users u
			ON u.id = t.user_id
		JOIN waste_banks wb
			ON wb.id = t.waste_bank_id
		LEFT JOIN campaigns c
			ON c.id = t.campaign_id
		WHERE t.id = $1
		`,
		transactionID,
	).Scan(
		&result.ID,
		&result.UserID,
		&result.UserName,
		&result.WasteBankID,
		&result.WasteBank,
		&result.CampaignID,
		&result.Campaign,
		&result.TotalWeight,
		&result.TotalValue,
		&result.Status,
		&result.CreatedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}

	rows, err := r.db.Query(
		ctx,
		`
		SELECT
			ti.category_id,
			wc.name,
			COALESCE(ti.weight, 0)::float8,
			COALESCE(ti.price_per_kg, 0)::float8,
			COALESCE(ti.subtotal, 0)::float8
		FROM transaction_items ti
		JOIN waste_categories wc
			ON wc.id = ti.category_id
		WHERE ti.transaction_id = $1
		ORDER BY ti.id
		`,
		transactionID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result.Items = make([]CreatedTransactionItem, 0)

	for rows.Next() {
		var item CreatedTransactionItem

		if err := rows.Scan(
			&item.WasteCategoryID,
			&item.WasteCategoryName,
			&item.Weight,
			&item.UnitPrice,
			&item.Subtotal,
		); err != nil {
			return nil, err
		}

		result.Items = append(result.Items, item)
	}

	return result, rows.Err()
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

func (r *TransactionRepository) Verify(
	ctx context.Context,
	transactionID int64,
	verifierUserID int64,
) (*VerifiedTransaction, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	var (
		userID      int64
		wasteBankID int64
		campaignID  *int64
		totalWeight float64
		totalValue  float64
		status      string
	)

	err = tx.QueryRow(
		ctx,
		`
		SELECT
			user_id,
			waste_bank_id,
			campaign_id,
			COALESCE(total_weight, 0)::float8,
			COALESCE(total_value, 0)::float8,
			status
		FROM transactions
		WHERE id = $1
		FOR UPDATE
		`,
		transactionID,
	).Scan(
		&userID,
		&wasteBankID,
		&campaignID,
		&totalWeight,
		&totalValue,
		&status,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrTransactionNotFound
	}

	if err != nil {
		return nil, err
	}

	if status == "verified" {
		return nil, ErrTransactionAlreadyVerified
	}

	if status != "pending" {
		return nil, ErrTransactionCannotVerify
	}

	var authorized bool

	err = tx.QueryRow(
		ctx,
		`
		SELECT EXISTS (
			SELECT 1
			FROM waste_bank_members
			WHERE waste_bank_id = $1
			  AND user_id = $2
		)
		`,
		wasteBankID,
		verifierUserID,
	).Scan(&authorized)

	if err != nil {
		return nil, err
	}

	if !authorized {
		return nil, ErrTransactionVerifierNotAuthorized
	}

	_, err = tx.Exec(
		ctx,
		`
		UPDATE transactions
		SET status = 'verified'
		WHERE id = $1
		`,
		transactionID,
	)

	if err != nil {
		return nil, err
	}

	impactAdded := totalWeight
	ecoScoreAdded := int(math.Round(totalWeight * 10))
	campaignProgressAdded := 0.0

	if campaignID != nil {
		var organizationID int64

		err = tx.QueryRow(
			ctx,
			`
			SELECT organization_id
			FROM campaigns
			WHERE id = $1
			`,
			*campaignID,
		).Scan(&organizationID)

		if err != nil {
			return nil, err
		}

		co2Reduced :=
			math.Round(totalWeight*0.6*100) / 100

		_, err = tx.Exec(
			ctx,
			`
			INSERT INTO impact_records (
				user_id,
				campaign_id,
				organization_id,
				weight,
				co2_reduced
			)
			VALUES ($1, $2, $3, $4, $5)
			`,
			userID,
			*campaignID,
			organizationID,
			totalWeight,
			co2Reduced,
		)

		if err != nil {
			return nil, err
		}

		campaignProgressAdded = totalWeight
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	return &VerifiedTransaction{
		ID:                    transactionID,
		Status:                "verified",
		TotalWeight:           totalWeight,
		TotalValue:            totalValue,
		ImpactAdded:           impactAdded,
		EcoScoreAdded:         ecoScoreAdded,
		CampaignProgressAdded: campaignProgressAdded,
	}, nil
}
