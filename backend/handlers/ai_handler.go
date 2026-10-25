package handlers

import (
	"errors"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/noval110/ecolink/backend/services"
	"github.com/noval110/ecolink/backend/utils"
)

type AIHandler struct {
	service *services.AIService
}

func NewAIHandler(service *services.AIService) *AIHandler {
	return &AIHandler{
		service: service,
	}
}

func (h *AIHandler) PredictWaste(c echo.Context) error {
	if h.service == nil {
		return utils.ErrorResponse(c, http.StatusServiceUnavailable, "AI service is not configured")
	}

	// Bound the buffered multipart upload before parsing it or forwarding it to AI.
	c.Request().Body = http.MaxBytesReader(c.Response(), c.Request().Body, 10<<20)
	image, err := c.FormFile("image")
	if c.Request().MultipartForm != nil {
		defer c.Request().MultipartForm.RemoveAll()
	}
	if err != nil {
		var sizeError *http.MaxBytesError
		if errors.As(err, &sizeError) {
			return utils.ErrorResponse(c, http.StatusRequestEntityTooLarge, "Image upload must not exceed 10 MB")
		}
		return utils.ErrorResponse(c, http.StatusBadRequest, "A valid image upload is required")
	}
	contentType := image.Header.Get("Content-Type")
	if image.Size == 0 || !strings.HasPrefix(strings.ToLower(contentType), "image/") {
		return utils.ErrorResponse(c, http.StatusBadRequest, "File must be a non-empty image")
	}
	file, err := image.Open()
	if err != nil {
		return utils.ErrorResponse(c, http.StatusBadRequest, "Failed to open image")
	}
	defer file.Close()

	prediction, err := h.service.Predict(image.Filename, contentType, file)
	if err != nil {
		return utils.ErrorResponse(c, http.StatusBadGateway, err.Error())
	}
	return c.JSON(http.StatusOK, prediction)
}
