package main

import (
	"net/http"

	"github.com/labstack/echo/v4"
	echomiddleware "github.com/labstack/echo/v4/middleware"

	"github.com/noval110/ecolink/backend/config"
	"github.com/noval110/ecolink/backend/routes"
)

func main() {
	cfg := config.LoadConfig()

	e := echo.New()
	e.Use(echomiddleware.CORSWithConfig(echomiddleware.CORSConfig{
		AllowOrigins: []string{"http://localhost:5173"},
		AllowMethods: []string{
			http.MethodGet,
			http.MethodPost,
			http.MethodPut,
			http.MethodOptions,
		},
		AllowHeaders: []string{
			echo.HeaderOrigin,
			echo.HeaderContentType,
			echo.HeaderAccept,
			echo.HeaderAuthorization,
		},
	}))

	routes.RegisterRoutes(e)

	e.Logger.Fatal(e.Start(":" + cfg.AppPort))
}
