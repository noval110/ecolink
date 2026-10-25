package middleware

import (
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"

	"github.com/noval110/ecolink/backend/utils"
)

func RequireAuth(jwtSecret string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			authHeader := c.Request().Header.Get(echo.HeaderAuthorization)

			if authHeader == "" {
				return utils.ErrorResponse(
					c,
					http.StatusUnauthorized,
					"Authorization header is required",
				)
			}

			parts := strings.SplitN(authHeader, " ", 2)

			if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
				return utils.ErrorResponse(
					c,
					http.StatusUnauthorized,
					"Invalid authorization header",
				)
			}

			tokenString := strings.TrimSpace(parts[1])

			token, err := jwt.Parse(
				tokenString,
				func(token *jwt.Token) (interface{}, error) {
					return []byte(jwtSecret), nil
				},
				jwt.WithValidMethods([]string{
					jwt.SigningMethodHS256.Alg(),
				}),
			)

			if err != nil || !token.Valid {
				return utils.ErrorResponse(
					c,
					http.StatusUnauthorized,
					"Invalid or expired token",
				)
			}

			claims, ok := token.Claims.(jwt.MapClaims)
			if !ok {
				return utils.ErrorResponse(
					c,
					http.StatusUnauthorized,
					"Invalid token claims",
				)
			}

			userID, ok := claims["user_id"].(float64)
			if !ok {
				return utils.ErrorResponse(
					c,
					http.StatusUnauthorized,
					"Invalid user ID in token",
				)
			}

			role, ok := claims["role"].(string)
			if !ok {
				return utils.ErrorResponse(
					c,
					http.StatusUnauthorized,
					"Invalid role in token",
				)
			}

			c.Set("user_id", int64(userID))
			c.Set("role", role)

			return next(c)
		}
	}
}