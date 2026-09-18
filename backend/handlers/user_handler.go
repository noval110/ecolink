package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/noval110/ecolink/backend/mock"
	"github.com/noval110/ecolink/backend/utils"
)

type userSummaryResponse struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Username string `json:"username"`
	Role     string `json:"role"`
}

type userStatsResponse struct {
	TotalRecycled   float64 `json:"total_recycled"`
	VerifiedActions int     `json:"verified_actions"`
	CampaignJoined  int     `json:"campaign_joined"`
	EcoScore        int     `json:"eco_score"`
}

type activeCampaignResponse struct {
	ID               string  `json:"id"`
	Title            string  `json:"title"`
	TargetWeight     float64 `json:"target_weight"`
	CurrentWeight    float64 `json:"current_weight"`
	UserContribution float64 `json:"user_contribution"`
}

type impactSummaryResponse struct {
	TotalRecycled float64 `json:"total_recycled"`
	CO2Avoided    float64 `json:"co2_avoided"`
}

type dashboardResponse struct {
	User               userSummaryResponse          `json:"user"`
	Stats              userStatsResponse            `json:"stats"`
	ActiveCampaign     *activeCampaignResponse      `json:"active_campaign"`
	RecentTransactions []transactionHistoryResponse `json:"recent_transactions"`
	ImpactSummary      impactSummaryResponse        `json:"impact_summary"`
}

type passportResponse struct {
	UserID          string              `json:"user_id"`
	Name            string              `json:"name"`
	Username        string              `json:"username"`
	EcoLevel        string              `json:"eco_level"`
	EcoScore        int                 `json:"eco_score"`
	TotalRecycled   float64             `json:"total_recycled"`
	VerifiedActions int                 `json:"verified_actions"`
	CampaignJoined  int                 `json:"campaign_joined"`
	QRCode          string              `json:"qr_code"`
	Badges          []mock.Badge        `json:"badges"`
	RecentImpact    []impactHistoryItem `json:"recent_impact"`
}

func GetDashboard(c echo.Context) error {
	user, _ := mock.GetUser("usr_001")
	stats, _ := mock.GetUserStats(user.ID)
	campaign, campaignFound := mock.GetCampaign("cmp_001")

	var activeCampaign *activeCampaignResponse
	if campaignFound {
		activeCampaign = &activeCampaignResponse{
			ID:               campaign.ID,
			Title:            campaign.Title,
			TargetWeight:     campaign.TargetWeight,
			CurrentWeight:    campaign.CurrentWeight,
			UserContribution: userCampaignContribution(user.ID, campaign.ID),
		}
	}

	transactions := mock.ListUserTransactions(user.ID, "")
	if len(transactions) > 3 {
		transactions = transactions[:3]
	}
	recentTransactions := make([]transactionHistoryResponse, 0, len(transactions))
	for _, transaction := range transactions {
		recentTransactions = append(recentTransactions, buildTransactionHistory(transaction))
	}

	data := dashboardResponse{
		User: userSummaryResponse{
			ID:       user.ID,
			Name:     user.Name,
			Username: user.Username,
			Role:     user.Role,
		},
		Stats: userStatsResponse{
			TotalRecycled:   stats.TotalRecycled,
			VerifiedActions: stats.VerifiedActions,
			CampaignJoined:  stats.CampaignJoined,
			EcoScore:        stats.EcoScore,
		},
		ActiveCampaign:     activeCampaign,
		RecentTransactions: recentTransactions,
		ImpactSummary: impactSummaryResponse{
			TotalRecycled: stats.TotalRecycled,
			CO2Avoided:    stats.CO2Avoided,
		},
	}

	return utils.SuccessResponse(c, http.StatusOK, "Dashboard loaded", data)
}

func GetPassport(c echo.Context) error {
	user, _ := mock.GetUser("usr_001")
	stats, _ := mock.GetUserStats(user.ID)
	recentImpact := buildImpactHistory(user.ID)
	if len(recentImpact) > 3 {
		recentImpact = recentImpact[:3]
	}

	data := passportResponse{
		UserID:          user.ID,
		Name:            user.Name,
		Username:        user.Username,
		EcoLevel:        ecoLevel(stats.EcoScore),
		EcoScore:        stats.EcoScore,
		TotalRecycled:   stats.TotalRecycled,
		VerifiedActions: stats.VerifiedActions,
		CampaignJoined:  stats.CampaignJoined,
		QRCode:          "ECO-USR-001",
		Badges:          mock.GetUserBadges(user.ID),
		RecentImpact:    recentImpact,
	}

	return utils.SuccessResponse(c, http.StatusOK, "Eco Passport loaded", data)
}

func ecoLevel(score int) string {
	if score >= 1000 {
		return "Green Advocate"
	}
	if score >= 500 {
		return "Eco Contributor"
	}
	return "Eco Starter"
}

func userCampaignContribution(userID, campaignID string) float64 {
	transactions := mock.ListUserTransactions(userID, "verified")
	var contribution float64
	for _, transaction := range transactions {
		if transaction.CampaignID == campaignID {
			contribution += transaction.TotalWeight
		}
	}
	return contribution
}
