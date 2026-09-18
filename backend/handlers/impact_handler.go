package handlers

import (
	"math"
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/noval110/ecolink/backend/mock"
	"github.com/noval110/ecolink/backend/utils"
)

type impactWasteBankResponse struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type impactCampaignResponse struct {
	ID    string `json:"id"`
	Title string `json:"title"`
}

type impactHistoryItem struct {
	TransactionID string                  `json:"transaction_id"`
	WasteBank     impactWasteBankResponse `json:"waste_bank"`
	Campaign      *impactCampaignResponse `json:"campaign"`
	Material      string                  `json:"material"`
	Weight        float64                 `json:"weight"`
	EcoScoreAdded int                     `json:"eco_score_added"`
	Status        string                  `json:"status"`
	VerifiedAt    string                  `json:"verified_at"`
}

type myImpactResponse struct {
	UserID          string              `json:"user_id"`
	TotalRecycled   float64             `json:"total_recycled"`
	CO2Avoided      float64             `json:"co2_avoided"`
	EcoScore        int                 `json:"eco_score"`
	VerifiedActions int                 `json:"verified_actions"`
	CampaignJoined  int                 `json:"campaign_joined"`
	ImpactHistory   []impactHistoryItem `json:"impact_history"`
}

func GetMyImpact(c echo.Context) error {
	stats, _ := mock.GetUserStats("usr_001")
	data := myImpactResponse{
		UserID:          "usr_001",
		TotalRecycled:   stats.TotalRecycled,
		CO2Avoided:      stats.CO2Avoided,
		EcoScore:        stats.EcoScore,
		VerifiedActions: stats.VerifiedActions,
		CampaignJoined:  stats.CampaignJoined,
		ImpactHistory:   buildImpactHistory("usr_001"),
	}

	return utils.SuccessResponse(c, http.StatusOK, "Impact loaded", data)
}

func buildImpactHistory(userID string) []impactHistoryItem {
	transactions := mock.ListUserTransactions(userID, "verified")
	history := make([]impactHistoryItem, 0, len(transactions))
	for _, transaction := range transactions {
		wasteBank, _ := mock.GetWasteBank(transaction.WasteBankID)
		campaign := buildImpactCampaign(transaction.CampaignID)

		for _, item := range transaction.Items {
			category, _ := mock.GetWasteCategory(item.WasteCategoryID)
			history = append(history, impactHistoryItem{
				TransactionID: transaction.ID,
				WasteBank: impactWasteBankResponse{
					ID:   wasteBank.ID,
					Name: wasteBank.Name,
				},
				Campaign:      campaign,
				Material:      category.Name,
				Weight:        item.Weight,
				EcoScoreAdded: int(math.Round(item.Weight * 10)),
				Status:        transaction.Status,
				VerifiedAt:    transaction.VerifiedAt,
			})
		}
	}
	return history
}

func buildImpactCampaign(campaignID string) *impactCampaignResponse {
	if campaignID == "" {
		return nil
	}
	campaign, found := mock.GetCampaign(campaignID)
	if !found {
		return nil
	}
	return &impactCampaignResponse{ID: campaign.ID, Title: campaign.Title}
}
