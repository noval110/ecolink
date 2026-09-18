package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/noval110/ecolink/backend/mock"
	"github.com/noval110/ecolink/backend/utils"
)

type wasteBankSummary struct {
	ID         string  `json:"id"`
	Name       string  `json:"name"`
	DistanceKM float64 `json:"distance_km"`
	Status     string  `json:"status"`
	Latitude   float64 `json:"latitude"`
	Longitude  float64 `json:"longitude"`
}

type wasteBankPriceResponse struct {
	WasteCategoryID string `json:"waste_category_id"`
	Name            string `json:"name"`
	PricePerKg      int    `json:"price_per_kg"`
	Unit            string `json:"unit"`
}

type wasteBankDetailResponse struct {
	ID                string                   `json:"id"`
	Name              string                   `json:"name"`
	Description       string                   `json:"description"`
	Address           string                   `json:"address"`
	Latitude          float64                  `json:"latitude"`
	Longitude         float64                  `json:"longitude"`
	Phone             string                   `json:"phone"`
	OpeningHours      string                   `json:"opening_hours"`
	Status            string                   `json:"status"`
	AcceptedMaterials []wasteBankPriceResponse `json:"accepted_materials"`
}

func GetWasteBanks(c echo.Context) error {
	wasteBanks := mock.ListWasteBanks()
	data := make([]wasteBankSummary, 0, len(wasteBanks))
	for _, wasteBank := range wasteBanks {
		data = append(data, wasteBankSummary{
			ID:         wasteBank.ID,
			Name:       wasteBank.Name,
			DistanceKM: wasteBank.DistanceKM,
			Status:     wasteBank.Status,
			Latitude:   wasteBank.Latitude,
			Longitude:  wasteBank.Longitude,
		})
	}

	return utils.SuccessResponse(c, http.StatusOK, "Waste banks loaded", data)
}

func GetWasteBankByID(c echo.Context) error {
	wasteBank, found := mock.GetWasteBank(c.Param("id"))
	if !found {
		return utils.NotFoundResponse(c, "Waste bank not found")
	}

	data := wasteBankDetailResponse{
		ID:                wasteBank.ID,
		Name:              wasteBank.Name,
		Description:       wasteBank.Description,
		Address:           wasteBank.Address,
		Latitude:          wasteBank.Latitude,
		Longitude:         wasteBank.Longitude,
		Phone:             wasteBank.Phone,
		OpeningHours:      wasteBank.OpeningHours,
		Status:            wasteBank.Status,
		AcceptedMaterials: buildWasteBankPrices(wasteBank.ID),
	}

	return utils.SuccessResponse(c, http.StatusOK, "Waste bank detail loaded", data)
}

func GetWasteBankPrices(c echo.Context) error {
	wasteBankID := c.Param("id")
	if _, found := mock.GetWasteBank(wasteBankID); !found {
		return utils.NotFoundResponse(c, "Waste bank not found")
	}

	return utils.SuccessResponse(
		c,
		http.StatusOK,
		"Waste bank prices loaded",
		buildWasteBankPrices(wasteBankID),
	)
}

func buildWasteBankPrices(wasteBankID string) []wasteBankPriceResponse {
	prices, _ := mock.GetWasteBankPrices(wasteBankID)
	data := make([]wasteBankPriceResponse, 0, len(prices))
	for _, price := range prices {
		category, found := mock.GetWasteCategory(price.WasteCategoryID)
		if !found {
			continue
		}
		data = append(data, wasteBankPriceResponse{
			WasteCategoryID: category.ID,
			Name:            category.Name,
			PricePerKg:      price.PricePerKg,
			Unit:            category.Unit,
		})
	}
	return data
}
