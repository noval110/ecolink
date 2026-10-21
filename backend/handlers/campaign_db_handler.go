package handlers

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"

	"github.com/noval110/ecolink/backend/repositories"
	"github.com/noval110/ecolink/backend/utils"
)

type CampaignDBHandler struct {
	repository *repositories.CampaignRepository
}

func NewCampaignDBHandler(
	repository *repositories.CampaignRepository,
) *CampaignDBHandler {
	return &CampaignDBHandler{
		repository: repository,
	}
}

func (h *CampaignDBHandler) List(
	c echo.Context,
) error {
	campaigns, err := h.repository.List(
		c.Request().Context(),
	)
	if err != nil {
		return utils.ErrorResponse(
			c,
			http.StatusInternalServerError,
			"Failed to load campaigns",
		)
	}

	return utils.SuccessResponse(
		c,
		http.StatusOK,
		"Campaigns loaded",
		campaigns,
	)
}

func (h *CampaignDBHandler) Detail(
	c echo.Context,
) error {
	id, err := strconv.ParseInt(
		c.Param("id"),
		10,
		64,
	)
	if err != nil {
		return utils.ErrorResponse(
			c,
			http.StatusBadRequest,
			"Invalid campaign ID",
		)
	}

	campaign, err := h.repository.GetByID(
		c.Request().Context(),
		id,
	)
	if err != nil {
		return utils.ErrorResponse(
			c,
			http.StatusInternalServerError,
			"Failed to load campaign",
		)
	}

	if campaign == nil {
		return utils.NotFoundResponse(
			c,
			"Campaign not found",
		)
	}

	return utils.SuccessResponse(
		c,
		http.StatusOK,
		"Campaign detail loaded",
		campaign,
	)
}