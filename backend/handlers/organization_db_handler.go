package handlers

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/labstack/echo/v4"

	"github.com/noval110/ecolink/backend/repositories"
	"github.com/noval110/ecolink/backend/utils"
)

type OrganizationDBHandler struct {
	repository *repositories.OrganizationRepository
}

type createOrganizationCampaignRequest struct {
	Title               string  `json:"title"`
	Description         *string `json:"description"`
	StartDate           string  `json:"start_date"`
	EndDate             string  `json:"end_date"`
	TargetKG            float64 `json:"target_kg"`
	PartnerWasteBankIDs []int64 `json:"partner_waste_bank_ids"`
}

type updateCampaignStatusRequest struct {
	Status string `json:"status"`
}

func (h *OrganizationDBHandler) UpdateCampaignStatus(c echo.Context) error {
	userID, ok := getOrganizationUser(c)
	if !ok {
		return utils.ErrorResponse(c, http.StatusForbidden, "Only organization users can access this resource")
	}
	campaignID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil || campaignID <= 0 {
		return utils.ErrorResponse(c, http.StatusBadRequest, "Invalid campaign ID")
	}
	var req updateCampaignStatusRequest
	if err := c.Bind(&req); err != nil {
		return utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body")
	}
	if req.Status != "active" && req.Status != "completed" && req.Status != "cancelled" {
		return utils.ErrorResponse(c, http.StatusBadRequest, "Invalid campaign status")
	}
	organization, err := h.repository.GetByUserID(c.Request().Context(), userID)
	if err != nil {
		return utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to load organization")
	}
	if organization == nil {
		return utils.NotFoundResponse(c, "Organization not found for this user")
	}
	if err := h.repository.UpdateCampaignStatus(c.Request().Context(), organization.ID, campaignID, req.Status); err != nil {
		return utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
	}
	return utils.SuccessResponse(c, http.StatusOK, "Campaign status updated", map[string]any{
		"campaign_id": campaignID,
		"status":      req.Status,
	})
}

func (h *OrganizationDBHandler) CreateCampaign(c echo.Context) error {
	userID, ok := getOrganizationUser(c)
	if !ok {
		return utils.ErrorResponse(c, http.StatusForbidden, "Only organization users can access this resource")
	}

	var req createOrganizationCampaignRequest
	if err := c.Bind(&req); err != nil {
		return utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body")
	}
	req.Title = strings.TrimSpace(req.Title)
	if req.Title == "" {
		return utils.ErrorResponse(c, http.StatusBadRequest, "Campaign title is required")
	}
	if req.TargetKG <= 0 {
		return utils.ErrorResponse(c, http.StatusBadRequest, "Target must be greater than zero")
	}
	if len(req.PartnerWasteBankIDs) == 0 {
		return utils.ErrorResponse(c, http.StatusBadRequest, "At least one partner waste bank is required")
	}
	startDate, err := time.Parse("2006-01-02", req.StartDate)
	if err != nil {
		return utils.ErrorResponse(c, http.StatusBadRequest, "Invalid start date")
	}
	endDate, err := time.Parse("2006-01-02", req.EndDate)
	if err != nil {
		return utils.ErrorResponse(c, http.StatusBadRequest, "Invalid end date")
	}
	if endDate.Before(startDate) {
		return utils.ErrorResponse(c, http.StatusBadRequest, "End date cannot be before start date")
	}

	organization, err := h.repository.GetByUserID(c.Request().Context(), userID)
	if err != nil {
		return utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to load organization")
	}
	if organization == nil {
		return utils.NotFoundResponse(c, "Organization not found for this user")
	}
	campaign, err := h.repository.CreateCampaign(
		c.Request().Context(),
		organization.ID,
		repositories.CreateOrganizationCampaignInput{
			Title:               req.Title,
			Description:         req.Description,
			StartDate:           &startDate,
			EndDate:             &endDate,
			TargetWeight:        req.TargetKG,
			PartnerWasteBankIDs: req.PartnerWasteBankIDs,
		},
	)
	if err != nil {
		return utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
	}
	return utils.SuccessResponse(c, http.StatusCreated, "Campaign created", campaign)
}

func NewOrganizationDBHandler(
	repository *repositories.OrganizationRepository,
) *OrganizationDBHandler {
	return &OrganizationDBHandler{
		repository: repository,
	}
}

func getOrganizationUser(
	c echo.Context,
) (int64, bool) {

	userID, ok :=
		c.Get("user_id").(int64)

	if !ok {
		return 0, false
	}

	role, _ :=
		c.Get("role").(string)

	if role != "organization" {
		return 0, false
	}

	return userID, true
}

func (h *OrganizationDBHandler) Dashboard(
	c echo.Context,
) error {

	userID, ok :=
		getOrganizationUser(c)

	if !ok {
		return utils.ErrorResponse(
			c,
			http.StatusForbidden,
			"Only organization users can access this resource",
		)
	}

	dashboard, err :=
		h.repository.GetDashboard(
			c.Request().Context(),
			userID,
		)

	if err != nil {
		return utils.ErrorResponse(
			c,
			http.StatusInternalServerError,
			"Failed to load organization dashboard",
		)
	}
	if dashboard == nil {
		return utils.NotFoundResponse(c, "Organization not found for this user")
	}

	return utils.SuccessResponse(
		c,
		http.StatusOK,
		"Organization dashboard loaded",
		dashboard,
	)
}

func (h *OrganizationDBHandler) Campaigns(
	c echo.Context,
) error {

	userID, ok :=
		getOrganizationUser(c)

	if !ok {
		return utils.ErrorResponse(
			c,
			http.StatusForbidden,
			"Only organization users can access this resource",
		)
	}

	organization, err :=
		h.repository.GetByUserID(
			c.Request().Context(),
			userID,
		)

	if err != nil {
		return utils.ErrorResponse(
			c,
			http.StatusInternalServerError,
			"Failed to load organization",
		)
	}
	if organization == nil {
		return utils.NotFoundResponse(c, "Organization not found for this user")
	}

	campaigns, err :=
		h.repository.ListCampaigns(
			c.Request().Context(),
			organization.ID,
		)

	if err != nil {
		return utils.ErrorResponse(
			c,
			http.StatusInternalServerError,
			"Failed to load organization campaigns",
		)
	}

	return utils.SuccessResponse(
		c,
		http.StatusOK,
		"Organization campaigns loaded",
		campaigns,
	)
}
