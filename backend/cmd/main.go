package main

import (
	"net/http"
	"os"

	"github.com/labstack/echo/v4"
	echomiddleware "github.com/labstack/echo/v4/middleware"

	"github.com/noval110/ecolink/backend/config"
	"github.com/noval110/ecolink/backend/database"
	"github.com/noval110/ecolink/backend/handlers"
	"github.com/noval110/ecolink/backend/repositories"
	"github.com/noval110/ecolink/backend/routes"
	"github.com/noval110/ecolink/backend/services"
)

func main() {
	cfg := config.LoadConfig()

	db, err := database.ConnectPostgres(cfg)
	if err != nil {
		panic("failed to connect PostgreSQL: " + err.Error())
	}
	defer db.Close()

	authRepository := repositories.NewAuthRepository(db)
	authService := services.NewAuthService(
		authRepository,
		cfg.JWTSecret,
	)
	authHandler := handlers.NewAuthHandler(authService)

	userRepository := repositories.NewUserRepository(db)
	dashboardRepository := repositories.NewDashboardRepository(db)
	dashboardHandler := handlers.NewDashboardHandler(
		dashboardRepository,
	)
	profileHandler := handlers.NewProfileHandler(userRepository)

	wasteCategoryRepository := repositories.NewWasteCategoryRepository(db)
	wasteCategoryHandler := handlers.NewWasteCategoryHandler(
		wasteCategoryRepository,
	)

	wasteBankRepository := repositories.NewWasteBankRepository(db)
	wasteBankHandler := handlers.NewWasteBankDBHandler(
		wasteBankRepository,
	)

	campaignRepository := repositories.NewCampaignRepository(db)
	campaignHandler := handlers.NewCampaignDBHandler(
		campaignRepository,
	)

	transactionRepository := repositories.NewTransactionRepository(db)
	transactionHandler := handlers.NewTransactionDBHandler(
		transactionRepository,
	)

	passportRepository := repositories.NewPassportRepository(db)
	passportHandler := handlers.NewPassportHandler(
		passportRepository,
	)

	gamificationRepository := repositories.NewGamificationRepository(db)
	gamificationHandler := handlers.NewGamificationHandler(
		gamificationRepository,
	)

	organizationRepository := repositories.NewOrganizationRepository(db)
	organizationHandler := handlers.NewOrganizationDBHandler(organizationRepository)

	aiServiceURL := os.Getenv("AI_SERVICE_URL")
	if aiServiceURL == "" {
		aiServiceURL = "http://127.0.0.1:8000"
	}
	aiService := services.NewAIService(aiServiceURL)
	aiHandler := handlers.NewAIHandler(aiService)

	e := echo.New()

	e.Logger.Info("PostgreSQL connected successfully")

	e.Use(echomiddleware.CORSWithConfig(echomiddleware.CORSConfig{
		AllowOrigins: []string{
			"http://localhost:5173",
			"https://ecolink-sigma.vercel.app",
		},
		AllowMethods: []string{
			http.MethodGet,
			http.MethodPost,
			http.MethodPut,
			http.MethodPatch,
			http.MethodDelete,
			http.MethodOptions,
		},
		AllowHeaders: []string{
			echo.HeaderOrigin,
			echo.HeaderContentType,
			echo.HeaderAccept,
			echo.HeaderAuthorization,
		},
	}))

	routes.RegisterRoutesWithAuth(
		e,
		authHandler,
		profileHandler,
		dashboardHandler,
		wasteCategoryHandler,
		wasteBankHandler,
		campaignHandler,
		transactionHandler,
		passportHandler,
		gamificationHandler,
		organizationHandler,
		aiHandler,
		cfg.JWTSecret,
	)

	e.Logger.Fatal(e.Start(":" + cfg.AppPort))
}
