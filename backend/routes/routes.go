package routes

import (
	"github.com/labstack/echo/v4"

	"github.com/noval110/ecolink/backend/handlers"
	"github.com/noval110/ecolink/backend/middleware"
)

func RegisterRoutes(e *echo.Echo) {
	registerRoutes(
		e,
		handlers.NewAuthHandler(nil),
		nil,
		nil,
		nil,
		"",
	)
}

func RegisterRoutesWithAuth(
	e *echo.Echo,
	authHandler *handlers.AuthHandler,
	profileHandler *handlers.ProfileHandler,
	dashboardHandler *handlers.DashboardHandler,
	wasteCategoryHandler *handlers.WasteCategoryHandler,
	jwtSecret string,
) {
	registerRoutes(
		e,
		authHandler,
		profileHandler,
		dashboardHandler,
		wasteCategoryHandler,
		jwtSecret,
	)
}

func registerRoutes(
	e *echo.Echo,
	authHandler *handlers.AuthHandler,
	profileHandler *handlers.ProfileHandler,
	dashboardHandler *handlers.DashboardHandler,
	wasteCategoryHandler *handlers.WasteCategoryHandler,
	jwtSecret string,
) {
	api := e.Group("/api")

	api.GET("/health", handlers.GetHealth)

	auth := api.Group("/auth")
	auth.POST("/register", authHandler.Register)
	auth.POST("/login", authHandler.Login)

	me := api.Group("/me")

	if jwtSecret != "" {
		me.Use(middleware.RequireAuth(jwtSecret))
	}

	if profileHandler != nil {
		me.GET("/profile", profileHandler.GetProfile)
	}

	if dashboardHandler != nil {
		me.GET("/dashboard", dashboardHandler.GetDashboard)
	} else {
		me.GET("/dashboard", handlers.GetDashboard)
	}
	me.GET("/passport", handlers.GetPassport)
	me.GET("/impact", handlers.GetMyImpact)
	me.GET("/transactions", handlers.GetMyTransactions)

	api.GET("/waste-banks", handlers.GetWasteBanks)
	api.GET("/waste-banks/:id/prices", handlers.GetWasteBankPrices)
	api.GET("/waste-banks/:id", handlers.GetWasteBankByID)
	if wasteCategoryHandler != nil {
		api.GET(
			"/waste-categories",
			wasteCategoryHandler.List,
		)
	} else {
		api.GET(
			"/waste-categories",
			handlers.GetWasteCategories,
		)
	}

	api.GET("/campaigns", handlers.GetCampaigns)
	api.GET("/campaigns/:id", handlers.GetCampaignByID)
	api.POST("/campaigns/:id/join", handlers.JoinCampaign)

	api.POST("/transactions", handlers.CreateTransaction)
	api.GET("/transactions/:id", handlers.GetTransactionByID)
	api.PUT("/transactions/:id/verify", handlers.VerifyTransaction)

	api.GET("/organizations/:id/dashboard", handlers.GetOrganizationDashboard)
}
