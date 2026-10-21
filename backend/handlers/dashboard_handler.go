package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/noval110/ecolink/backend/repositories"
	"github.com/noval110/ecolink/backend/utils"
)

type DashboardHandler struct {
	repository *repositories.DashboardRepository
}

func NewDashboardHandler(
	repository *repositories.DashboardRepository,
) *DashboardHandler {
	return &DashboardHandler{
		repository: repository,
	}
}

type realDashboardUserResponse struct {
	ID       int64  `json:"id"`
	FullName string `json:"full_name"`
	Role     string `json:"role"`
}

type realDashboardStatsResponse struct {
	TotalRecycled   float64 `json:"total_recycled"`
	VerifiedActions int     `json:"verified_actions"`
	CampaignJoined  int     `json:"campaign_joined"`
	EcoScore        int     `json:"eco_score"`
}

type realDashboardImpactResponse struct {
	TotalRecycled float64 `json:"total_recycled"`
	CO2Avoided    float64 `json:"co2_avoided"`
}

type realDashboardResponse struct {
	User          realDashboardUserResponse   `json:"user"`
	Stats         realDashboardStatsResponse  `json:"stats"`
	ImpactSummary realDashboardImpactResponse `json:"impact_summary"`
}

func (h *DashboardHandler) GetDashboard(c echo.Context) error {
	userID, ok := c.Get("user_id").(int64)
	if !ok {
		return utils.ErrorResponse(
			c,
			http.StatusUnauthorized,
			"Invalid authenticated user",
		)
	}

	user, err := h.repository.GetUser(
		c.Request().Context(),
		userID,
	)
	if err != nil {
		return utils.ErrorResponse(
			c,
			http.StatusInternalServerError,
			"Failed to load dashboard user",
		)
	}

	stats, err := h.repository.GetStats(
		c.Request().Context(),
		userID,
	)
	if err != nil {
		return utils.ErrorResponse(
			c,
			http.StatusInternalServerError,
			"Failed to load dashboard stats",
		)
	}

	data := realDashboardResponse{
		User: realDashboardUserResponse{
			ID:       user.ID,
			FullName: user.FullName,
			Role:     user.Role,
		},
		Stats: realDashboardStatsResponse{
			TotalRecycled:   stats.TotalRecycled,
			VerifiedActions: stats.VerifiedActions,
			CampaignJoined:  stats.CampaignJoined,
			EcoScore:        stats.EcoScore,
		},
		ImpactSummary: realDashboardImpactResponse{
			TotalRecycled: stats.TotalRecycled,
			CO2Avoided:    stats.CO2Avoided,
		},
	}

	return utils.SuccessResponse(
		c,
		http.StatusOK,
		"Dashboard loaded",
		data,
	)
}