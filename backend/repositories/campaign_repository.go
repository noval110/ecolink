package repositories

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type CampaignPartnerWasteBank struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

type Campaign struct {
	ID                 int64                      `json:"id"`
	Title              string                     `json:"title"`
	OrganizationID     int64                      `json:"organization_id"`
	Organization       string                     `json:"organization"`
	Description        *string                    `json:"description,omitempty"`
	TargetWeight       float64                    `json:"target_weight"`
	CurrentWeight      float64                    `json:"current_weight"`
	UserContribution   float64                    `json:"user_contribution"`
	ProgressPercentage float64                    `json:"progress_percentage"`
	Participants       int                        `json:"participants"`
	StartDate          *string                    `json:"start_date,omitempty"`
	EndDate            *string                    `json:"end_date,omitempty"`
	Status             *string                    `json:"status,omitempty"`
	PartnerWasteBanks  []CampaignPartnerWasteBank `json:"partner_waste_banks"`
}

type CampaignRepository struct {
	db *pgxpool.Pool
}

func NewCampaignRepository(
	db *pgxpool.Pool,
) *CampaignRepository {
	return &CampaignRepository{
		db: db,
	}
}

func (r *CampaignRepository) ListByUser(
	ctx context.Context,
	userID int64,
) ([]Campaign, error) {
	rows, err := r.db.Query(
		ctx,
		`
		SELECT
			c.id,
			c.title,
			c.organization_id,
			o.name,
			c.description,

			COALESCE(c.target_kg, 0)::float8,

			COALESCE((
				SELECT SUM(t.total_weight)
				FROM transactions t
				WHERE t.campaign_id = c.id
				  AND t.status = 'verified'
			), 0)::float8,

			COALESCE((
				SELECT SUM(t.total_weight)
				FROM transactions t
				WHERE t.campaign_id = c.id
				  AND t.user_id = $1
				  AND t.status = 'verified'
			), 0)::float8,

			(
				SELECT COUNT(*)
				FROM campaigners cp2
				WHERE cp2.campaign_id = c.id
			)::int,

			c.start_date::text,
			c.end_date::text,
			c.status

		FROM campaigners cp
		JOIN campaigns c
			ON c.id = cp.campaign_id
		JOIN organizations o
			ON o.id = c.organization_id

		WHERE cp.user_id = $1
		  AND cp.status = 'joined'

		ORDER BY cp.joined_at DESC
		`,
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	campaigns := make([]Campaign, 0)

	for rows.Next() {
		var campaign Campaign

		err := rows.Scan(
			&campaign.ID,
			&campaign.Title,
			&campaign.OrganizationID,
			&campaign.Organization,
			&campaign.Description,
			&campaign.TargetWeight,
			&campaign.CurrentWeight,
			&campaign.UserContribution,
			&campaign.Participants,
			&campaign.StartDate,
			&campaign.EndDate,
			&campaign.Status,
		)
		if err != nil {
			return nil, err
		}

		campaign.ProgressPercentage =
			calculateCampaignProgress(
				campaign.CurrentWeight,
				campaign.TargetWeight,
			)

		partners, err :=
			r.GetPartnerWasteBanks(
				ctx,
				campaign.ID,
			)

		if err != nil {
			return nil, err
		}

		campaign.PartnerWasteBanks = partners

		campaigns = append(
			campaigns,
			campaign,
		)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return campaigns, nil
}

func (r *CampaignRepository) List(
	ctx context.Context,
) ([]Campaign, error) {
	rows, err := r.db.Query(
		ctx,
		`
		SELECT
			c.id,
			c.title,
			c.organization_id,
			o.name,
			c.description,

			COALESCE(c.target_kg, 0)::float8,

			COALESCE((
				SELECT SUM(t.total_weight)
				FROM transactions t
				WHERE t.campaign_id = c.id
				  AND t.status = 'verified'
			), 0)::float8,

			(
				SELECT COUNT(*)
				FROM campaigners cp
				WHERE cp.campaign_id = c.id
			)::int,

			c.start_date::text,
			c.end_date::text,
			c.status

		FROM campaigns c
		JOIN organizations o
			ON o.id = c.organization_id

		ORDER BY c.id
		`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	campaigns := make([]Campaign, 0)

	for rows.Next() {
		var campaign Campaign

		err := rows.Scan(
			&campaign.ID,
			&campaign.Title,
			&campaign.OrganizationID,
			&campaign.Organization,
			&campaign.Description,
			&campaign.TargetWeight,
			&campaign.CurrentWeight,
			&campaign.Participants,
			&campaign.StartDate,
			&campaign.EndDate,
			&campaign.Status,
		)
		if err != nil {
			return nil, err
		}

		campaign.ProgressPercentage =
			calculateCampaignProgress(
				campaign.CurrentWeight,
				campaign.TargetWeight,
			)

		partners, err := r.GetPartnerWasteBanks(
			ctx,
			campaign.ID,
		)
		if err != nil {
			return nil, err
		}

		campaign.PartnerWasteBanks = partners

		campaigns = append(campaigns, campaign)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return campaigns, nil
}

func (r *CampaignRepository) GetByID(
	ctx context.Context,
	id int64,
) (*Campaign, error) {
	campaign := &Campaign{}

	err := r.db.QueryRow(
		ctx,
		`
		SELECT
			c.id,
			c.title,
			c.organization_id,
			o.name,
			c.description,

			COALESCE(c.target_kg, 0)::float8,

			COALESCE((
				SELECT SUM(t.total_weight)
				FROM transactions t
				WHERE t.campaign_id = c.id
				  AND t.status = 'verified'
			), 0)::float8,

			(
				SELECT COUNT(*)
				FROM campaigners cp
				WHERE cp.campaign_id = c.id
			)::int,

			c.start_date::text,
			c.end_date::text,
			c.status

		FROM campaigns c
		JOIN organizations o
			ON o.id = c.organization_id
		WHERE c.id = $1
		`,
		id,
	).Scan(
		&campaign.ID,
		&campaign.Title,
		&campaign.OrganizationID,
		&campaign.Organization,
		&campaign.Description,
		&campaign.TargetWeight,
		&campaign.CurrentWeight,
		&campaign.Participants,
		&campaign.StartDate,
		&campaign.EndDate,
		&campaign.Status,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}

	campaign.ProgressPercentage =
		calculateCampaignProgress(
			campaign.CurrentWeight,
			campaign.TargetWeight,
		)

	partners, err := r.GetPartnerWasteBanks(
		ctx,
		campaign.ID,
	)
	if err != nil {
		return nil, err
	}

	campaign.PartnerWasteBanks = partners

	return campaign, nil
}

func (r *CampaignRepository) GetPartnerWasteBanks(
	ctx context.Context,
	campaignID int64,
) ([]CampaignPartnerWasteBank, error) {
	rows, err := r.db.Query(
		ctx,
		`
		SELECT
			wb.id,
			wb.name
		FROM campaign_waste_banks cwb
		JOIN waste_banks wb
			ON wb.id = cwb.waste_bank_id
		WHERE cwb.campaign_id = $1
		ORDER BY wb.id
		`,
		campaignID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	partners := make([]CampaignPartnerWasteBank, 0)

	for rows.Next() {
		var partner CampaignPartnerWasteBank

		if err := rows.Scan(
			&partner.ID,
			&partner.Name,
		); err != nil {
			return nil, err
		}

		partners = append(partners, partner)
	}

	return partners, rows.Err()
}

func calculateCampaignProgress(
	current float64,
	target float64,
) float64 {
	if target <= 0 {
		return 0
	}

	return current / target * 100
}

func (r *CampaignRepository) Join(
	ctx context.Context,
	campaignID int64,
	userID int64,
) (time.Time, bool, error) {
	var joinedAt time.Time

	err := r.db.QueryRow(
		ctx,
		`
		INSERT INTO campaigners (
			campaign_id,
			user_id,
			status
		)
		SELECT
			$1,
			$2,
			'joined'
		WHERE NOT EXISTS (
			SELECT 1
			FROM campaigners
			WHERE campaign_id = $1
			  AND user_id = $2
		)
		RETURNING joined_at
		`,
		campaignID,
		userID,
	).Scan(&joinedAt)

	if errors.Is(err, pgx.ErrNoRows) {
		return time.Time{}, false, nil
	}

	if err != nil {
		return time.Time{}, false, err
	}

	return joinedAt, true, nil
}
