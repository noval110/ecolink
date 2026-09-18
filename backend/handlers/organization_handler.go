package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/noval110/ecolink/backend/mock"
	"github.com/noval110/ecolink/backend/utils"
)

type organizationResponse struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

type organizationDashboardResponse struct {
	Organization        organizationResponse       `json:"organization"`
	CampaignCount       int                        `json:"campaign_count"`
	ActiveCampaigns     int                        `json:"active_campaigns"`
	TotalParticipants   int                        `json:"total_participants"`
	TotalWasteCollected float64                    `json:"total_waste_collected"`
	PartnerWasteBanks   []partnerWasteBankResponse `json:"partner_waste_banks"`
	Campaigns           []campaignResponse         `json:"campaigns"`
}

func GetOrganizationDashboard(c echo.Context) error {
	organization, found := mock.GetOrganization(c.Param("id"))
	if !found {
		return utils.NotFoundResponse(c, "Organization not found")
	}

	campaigns := mock.ListOrganizationCampaigns(organization.ID)
	campaignResponses := make([]campaignResponse, 0, len(campaigns))
	partnerIDs := make(map[string]struct{})
	var activeCampaigns int
	var totalParticipants int
	var totalWasteCollected float64

	for _, campaign := range campaigns {
		campaignResponses = append(campaignResponses, buildCampaignResponse(campaign))
		totalParticipants += campaign.Participants
		totalWasteCollected += campaign.CurrentWeight
		if campaign.Status == "active" {
			activeCampaigns++
		}
		for _, wasteBankID := range campaign.PartnerWasteBankIDs {
			partnerIDs[wasteBankID] = struct{}{}
		}
	}

	partners := make([]partnerWasteBankResponse, 0, len(partnerIDs))
	for _, wasteBank := range mock.ListWasteBanks() {
		if _, found := partnerIDs[wasteBank.ID]; !found {
			continue
		}
		partners = append(partners, partnerWasteBankResponse{
			ID:   wasteBank.ID,
			Name: wasteBank.Name,
		})
	}

	data := organizationDashboardResponse{
		Organization: organizationResponse{
			ID:          organization.ID,
			Name:        organization.Name,
			Description: organization.Description,
		},
		CampaignCount:       len(campaigns),
		ActiveCampaigns:     activeCampaigns,
		TotalParticipants:   totalParticipants,
		TotalWasteCollected: totalWasteCollected,
		PartnerWasteBanks:   partners,
		Campaigns:           campaignResponses,
	}

	return utils.SuccessResponse(c, http.StatusOK, "Organization dashboard loaded", data)
}
