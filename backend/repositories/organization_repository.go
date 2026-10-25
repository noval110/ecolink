package repositories

import (
	"context"
	"errors"
	"fmt"
	"math"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type OrganizationRepository struct {
	db *pgxpool.Pool
}

func NewOrganizationRepository(
	db *pgxpool.Pool,
) *OrganizationRepository {
	return &OrganizationRepository{
		db: db,
	}
}

type OrganizationSummary struct {
	ID          int64     `json:"id"`
	Name        string    `json:"name"`
	Type        *string   `json:"type,omitempty"`
	Description *string   `json:"description,omitempty"`
	Location    *string   `json:"location,omitempty"`
	MemberRole  *string   `json:"member_role,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
}

type OrganizationPartnerBank struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

type OrganizationCampaign struct {
	ID          int64   `json:"id"`
	Title       string  `json:"title"`
	Description *string `json:"description,omitempty"`

	StartDate *time.Time `json:"start_date,omitempty"`
	EndDate   *time.Time `json:"end_date,omitempty"`

	TargetWeight  float64 `json:"target_weight"`
	CurrentWeight float64 `json:"current_weight"`

	ProgressPercentage float64 `json:"progress_percentage"`
	Participants       int     `json:"participants"`

	Status string `json:"status"`

	PartnerWasteBanks []OrganizationPartnerBank `json:"partner_waste_banks"`
}

type OrganizationDashboard struct {
	Organization OrganizationSummary `json:"organization"`

	CampaignCount       int     `json:"campaign_count"`
	ActiveCampaigns     int     `json:"active_campaigns"`
	TotalParticipants   int     `json:"total_participants"`
	TotalWasteCollected float64 `json:"total_waste_collected"`

	PartnerWasteBanks []OrganizationPartnerBank `json:"partner_waste_banks"`
	Campaigns         []OrganizationCampaign    `json:"campaigns"`
}

type CreateOrganizationCampaignInput struct {
	Title               string
	Description         *string
	StartDate           *time.Time
	EndDate             *time.Time
	TargetWeight        float64
	PartnerWasteBankIDs []int64
}

func (r *OrganizationRepository) UpdateCampaignStatus(
	ctx context.Context,
	organizationID int64,
	campaignID int64,
	status string,
) error {
	commandTag, err := r.db.Exec(ctx, `
		UPDATE campaigns
		SET status = $3
		WHERE id = $1 AND organization_id = $2
	`, campaignID, organizationID, status)
	if err != nil {
		return err
	}
	if commandTag.RowsAffected() == 0 {
		return fmt.Errorf("campaign not found")
	}
	return nil
}

func (r *OrganizationRepository) CreateCampaign(
	ctx context.Context,
	organizationID int64,
	input CreateOrganizationCampaignInput,
) (*OrganizationCampaign, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	var campaignID int64
	err = tx.QueryRow(ctx, `
		INSERT INTO campaigns (
			organization_id, title, description, start_date, end_date, target_kg, status
		)
		VALUES ($1, $2, $3, $4, $5, $6, 'active')
		RETURNING id
	`, organizationID, input.Title, input.Description, input.StartDate, input.EndDate, input.TargetWeight).Scan(&campaignID)
	if err != nil {
		return nil, err
	}

	for _, wasteBankID := range input.PartnerWasteBankIDs {
		var exists bool
		err = tx.QueryRow(ctx, `
			SELECT EXISTS (SELECT 1 FROM waste_banks WHERE id = $1)
		`, wasteBankID).Scan(&exists)
		if err != nil {
			return nil, err
		}
		if !exists {
			return nil, fmt.Errorf("waste bank %d not found", wasteBankID)
		}

		_, err = tx.Exec(ctx, `
			INSERT INTO campaign_waste_banks (campaign_id, waste_bank_id)
			SELECT $1, $2
			WHERE NOT EXISTS (
				SELECT 1 FROM campaign_waste_banks
				WHERE campaign_id = $1 AND waste_bank_id = $2
			)
		`, campaignID, wasteBankID)
		if err != nil {
			return nil, err
		}
	}
	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	campaigns, err := r.ListCampaigns(ctx, organizationID)
	if err != nil {
		return nil, err
	}
	for _, campaign := range campaigns {
		if campaign.ID == campaignID {
			return &campaign, nil
		}
	}
	return nil, fmt.Errorf("created campaign not found")
}

func (r *OrganizationRepository) GetByUserID(
	ctx context.Context,
	userID int64,
) (*OrganizationSummary, error) {

	var organization OrganizationSummary

	err := r.db.QueryRow(
		ctx,
		`
		SELECT
			o.id,
			o.name,
			o.type,
			o.description,
			o.location,
			om.role,
			o.created_at
		FROM organization_members om
		JOIN organizations o
			ON o.id = om.organization_id
		WHERE om.user_id = $1
		ORDER BY om.joined_at ASC, om.id ASC
		LIMIT 1
		`,
		userID,
	).Scan(
		&organization.ID,
		&organization.Name,
		&organization.Type,
		&organization.Description,
		&organization.Location,
		&organization.MemberRole,
		&organization.CreatedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &organization, nil
}

func (r *OrganizationRepository) listPartnerBanks(
	ctx context.Context,
	organizationID int64,
) ([]OrganizationPartnerBank, error) {

	rows, err := r.db.Query(
		ctx,
		`
		SELECT DISTINCT
			wb.id,
			wb.name
		FROM campaign_waste_banks cwb
		JOIN campaigns c
			ON c.id = cwb.campaign_id
		JOIN waste_banks wb
			ON wb.id = cwb.waste_bank_id
		WHERE c.organization_id = $1
		ORDER BY wb.name
		`,
		organizationID,
	)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	items := make(
		[]OrganizationPartnerBank,
		0,
	)

	for rows.Next() {
		var item OrganizationPartnerBank

		if err := rows.Scan(
			&item.ID,
			&item.Name,
		); err != nil {
			return nil, err
		}

		items = append(
			items,
			item,
		)
	}

	return items, rows.Err()
}

func (r *OrganizationRepository) ListCampaigns(
	ctx context.Context,
	organizationID int64,
) ([]OrganizationCampaign, error) {

	rows, err := r.db.Query(
		ctx,
		`
		SELECT
			c.id,
			c.title,
			c.description,
			c.start_date,
			c.end_date,
			COALESCE(c.target_kg, 0)::float8,
			COALESCE((
				SELECT SUM(t.total_weight)
				FROM transactions t
				WHERE t.campaign_id = c.id
				  AND t.status = 'verified'
			), 0)::float8,
			(
				SELECT COUNT(DISTINCT cp.user_id)
				FROM campaigners cp
				WHERE cp.campaign_id = c.id
				  AND cp.status = 'joined'
			)::int,
			COALESCE(c.status, '')
		FROM campaigns c

		WHERE c.organization_id = $1

		ORDER BY c.created_at DESC, c.id DESC
		`,
		organizationID,
	)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	campaigns := make(
		[]OrganizationCampaign,
		0,
	)

	for rows.Next() {
		var campaign OrganizationCampaign

		if err := rows.Scan(
			&campaign.ID,
			&campaign.Title,
			&campaign.Description,
			&campaign.StartDate,
			&campaign.EndDate,
			&campaign.TargetWeight,
			&campaign.CurrentWeight,
			&campaign.Participants,
			&campaign.Status,
		); err != nil {
			return nil, err
		}

		if campaign.TargetWeight > 0 {
			campaign.ProgressPercentage = math.Round(
				(campaign.CurrentWeight/campaign.TargetWeight*100)*100,
			) / 100
		}

		campaign.PartnerWasteBanks = make([]OrganizationPartnerBank, 0)
		campaigns = append(campaigns, campaign)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}
	// Release the connection before fetching partners, including with a one-connection pool.
	rows.Close()
	if len(campaigns) == 0 {
		return campaigns, nil
	}

	campaignIndex := make(map[int64]int, len(campaigns))
	for index, campaign := range campaigns {
		campaignIndex[campaign.ID] = index
	}
	partnerRows, err := r.db.Query(
		ctx,
		`
		SELECT DISTINCT cwb.campaign_id, wb.id, wb.name
		FROM campaign_waste_banks cwb
		JOIN campaigns c ON c.id = cwb.campaign_id
		JOIN waste_banks wb ON wb.id = cwb.waste_bank_id
		WHERE c.organization_id = $1
		ORDER BY wb.name, wb.id
		`,
		organizationID,
	)
	if err != nil {
		return nil, err
	}
	defer partnerRows.Close()
	for partnerRows.Next() {
		var campaignID int64
		var partner OrganizationPartnerBank
		if err := partnerRows.Scan(&campaignID, &partner.ID, &partner.Name); err != nil {
			return nil, err
		}
		if index, ok := campaignIndex[campaignID]; ok {
			campaigns[index].PartnerWasteBanks = append(campaigns[index].PartnerWasteBanks, partner)
		}
	}
	return campaigns, partnerRows.Err()
}

func (r *OrganizationRepository) GetDashboard(
	ctx context.Context,
	userID int64,
) (*OrganizationDashboard, error) {

	organization, err :=
		r.GetByUserID(
			ctx,
			userID,
		)

	if err != nil || organization == nil {
		return nil, err
	}

	campaigns, err :=
		r.ListCampaigns(
			ctx,
			organization.ID,
		)

	if err != nil {
		return nil, err
	}

	partners, err :=
		r.listPartnerBanks(
			ctx,
			organization.ID,
		)

	if err != nil {
		return nil, err
	}

	var dashboard OrganizationDashboard

	dashboard.Organization =
		*organization

	dashboard.Campaigns =
		campaigns

	dashboard.PartnerWasteBanks =
		partners

	dashboard.CampaignCount =
		len(campaigns)

	for _, campaign := range campaigns {

		if campaign.Status == "active" {
			dashboard.ActiveCampaigns++
		}

		dashboard.TotalWasteCollected +=
			campaign.CurrentWeight
	}

	err = r.db.QueryRow(
		ctx,
		`
		SELECT COUNT(
			DISTINCT cp.user_id
		)::int
		FROM campaigners cp
		JOIN campaigns c
			ON c.id = cp.campaign_id
		WHERE c.organization_id = $1
		  AND cp.status = 'joined'
		`,
		organization.ID,
	).Scan(
		&dashboard.TotalParticipants,
	)

	if err != nil {
		return nil, err
	}

	return &dashboard, nil
}
