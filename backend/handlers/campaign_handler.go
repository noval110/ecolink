package handlers

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"

	"github.com/noval110/ecolink/backend/mock"
	"github.com/noval110/ecolink/backend/utils"
)

type partnerWasteBankResponse struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type campaignResponse struct {
	ID                 string                     `json:"id"`
	Title              string                     `json:"title"`
	Organization       string                     `json:"organization"`
	Description        string                     `json:"description"`
	TargetWeight       float64                    `json:"target_weight"`
	CurrentWeight      float64                    `json:"current_weight"`
	ProgressPercentage float64                    `json:"progress_percentage"`
	Participants       int                        `json:"participants"`
	StartDate          string                     `json:"start_date"`
	EndDate            string                     `json:"end_date"`
	Status             string                     `json:"status"`
	PartnerWasteBanks  []partnerWasteBankResponse `json:"partner_waste_banks"`
}

type campaignJoinResponse struct {
	CampaignID string `json:"campaign_id"`
	UserID     string `json:"user_id"`
	Status     string `json:"status"`
	JoinedAt   string `json:"joined_at"`
}

func GetCampaigns(c echo.Context) error {
	campaigns := mock.ListCampaigns()
	data := make([]campaignResponse, 0, len(campaigns))
	for _, campaign := range campaigns {
		data = append(data, buildCampaignResponse(campaign))
	}

	return utils.SuccessResponse(c, http.StatusOK, "Campaigns loaded", data)
}

func GetCampaignByID(c echo.Context) error {
	campaign, found := mock.GetCampaign(c.Param("id"))
	if !found {
		return utils.NotFoundResponse(c, "Campaign not found")
	}

	return utils.SuccessResponse(
		c,
		http.StatusOK,
		"Campaign detail loaded",
		buildCampaignResponse(campaign),
	)
}

func JoinCampaign(c echo.Context) error {
	campaignID := c.Param("id")
	if _, found := mock.GetCampaign(campaignID); !found {
		return utils.NotFoundResponse(c, "Campaign not found")
	}

	data := campaignJoinResponse{
		CampaignID: campaignID,
		UserID:     "usr_001",
		Status:     "joined",
		JoinedAt:   time.Now().Format(time.RFC3339),
	}

	return utils.SuccessResponse(c, http.StatusOK, "Successfully joined campaign", data)
}

func buildCampaignResponse(campaign mock.Campaign) campaignResponse {
	partners := make([]partnerWasteBankResponse, 0, len(campaign.PartnerWasteBankIDs))
	for _, wasteBankID := range campaign.PartnerWasteBankIDs {
		wasteBank, found := mock.GetWasteBank(wasteBankID)
		if !found {
			continue
		}
		partners = append(partners, partnerWasteBankResponse{
			ID:   wasteBank.ID,
			Name: wasteBank.Name,
		})
	}

	progress := 0.0
	if campaign.TargetWeight > 0 {
		progress = campaign.CurrentWeight / campaign.TargetWeight * 100
	}

	return campaignResponse{
		ID:                 campaign.ID,
		Title:              campaign.Title,
		Organization:       campaign.OrganizationName,
		Description:        campaign.Description,
		TargetWeight:       campaign.TargetWeight,
		CurrentWeight:      campaign.CurrentWeight,
		ProgressPercentage: progress,
		Participants:       campaign.Participants,
		StartDate:          campaign.StartDate,
		EndDate:            campaign.EndDate,
		Status:             campaign.Status,
		PartnerWasteBanks:  partners,
	}
}
