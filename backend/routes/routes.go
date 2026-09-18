package routes

import (
	"github.com/labstack/echo/v4"

	"github.com/noval110/ecolink/backend/handlers"
)

func RegisterRoutes(e *echo.Echo) {
	api := e.Group("/api")

	api.GET("/health", handlers.GetHealth)

	authHandler := handlers.NewAuthHandler()

	auth := api.Group("/auth")
	auth.POST("/register", authHandler.Register)
	auth.POST("/login", authHandler.Login)

	api.GET("/me/dashboard", handlers.GetDashboard)
	api.GET("/me/passport", handlers.GetPassport)
	api.GET("/me/impact", handlers.GetMyImpact)
	api.GET("/me/transactions", handlers.GetMyTransactions)

	api.GET("/waste-banks", handlers.GetWasteBanks)
	api.GET("/waste-banks/:id/prices", handlers.GetWasteBankPrices)
	api.GET("/waste-banks/:id", handlers.GetWasteBankByID)
	api.GET("/waste-categories", handlers.GetWasteCategories)

	api.GET("/campaigns", handlers.GetCampaigns)
	api.GET("/campaigns/:id", handlers.GetCampaignByID)
	api.POST("/campaigns/:id/join", handlers.JoinCampaign)

	api.POST("/transactions", handlers.CreateTransaction)
	api.GET("/transactions/:id", handlers.GetTransactionByID)
	api.PUT("/transactions/:id/verify", handlers.VerifyTransaction)

	api.GET("/organizations/:id/dashboard", handlers.GetOrganizationDashboard)
}
