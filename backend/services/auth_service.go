package services

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"github.com/noval110/ecolink/backend/models"
	"github.com/noval110/ecolink/backend/repositories"
)

var (
	ErrEmailAlreadyRegistered = errors.New("email already registered")
	ErrInvalidCredentials     = errors.New("invalid email or password")
	ErrInvalidRole            = errors.New("invalid role")
	ErrInvalidInput           = errors.New("invalid input")
	ErrInactiveUser           = errors.New("user is inactive")
)

type AuthService struct {
	repo      *repositories.AuthRepository
	jwtSecret []byte
}

func NewAuthService(
	repo *repositories.AuthRepository,
	jwtSecret string,
) *AuthService {
	return &AuthService{
		repo:      repo,
		jwtSecret: []byte(jwtSecret),
	}
}

func (s *AuthService) Register(
	ctx context.Context,
	fullName string,
	email string,
	password string,
	role string,
) (*models.User, string, error) {
	fullName = strings.TrimSpace(fullName)
	email = strings.ToLower(strings.TrimSpace(email))

	if fullName == "" || email == "" || len(password) < 8 {
		return nil, "", ErrInvalidInput
	}

	roleName, ok := normalizeRole(role)
	if !ok {
		return nil, "", ErrInvalidRole
	}

	existingUser, err := s.repo.GetUserByEmail(ctx, email)
	if err != nil {
		return nil, "", err
	}

	if existingUser != nil {
		return nil, "", ErrEmailAlreadyRegistered
	}

	roleID, err := s.repo.GetRoleIDByName(ctx, roleName)
	if err != nil {
		return nil, "", err
	}

	passwordHash, err := bcrypt.GenerateFromPassword(
		[]byte(password),
		bcrypt.DefaultCost,
	)
	if err != nil {
		return nil, "", err
	}

	user, err := s.repo.CreateUser(
		ctx,
		roleID,
		email,
		string(passwordHash),
		fullName,
	)
	if err != nil {
		return nil, "", err
	}

	user.Role = roleName

	token, err := s.generateToken(user)
	if err != nil {
		return nil, "", err
	}

	return user, token, nil
}

func (s *AuthService) Login(
	ctx context.Context,
	email string,
	password string,
) (*models.User, string, error) {
	email = strings.ToLower(strings.TrimSpace(email))

	user, err := s.repo.GetUserByEmail(ctx, email)
	if err != nil {
		return nil, "", err
	}

	if user == nil {
		return nil, "", ErrInvalidCredentials
	}

	if !user.IsActive {
		return nil, "", ErrInactiveUser
	}

	err = bcrypt.CompareHashAndPassword(
		[]byte(user.Password),
		[]byte(password),
	)
	if err != nil {
		return nil, "", ErrInvalidCredentials
	}

	token, err := s.generateToken(user)
	if err != nil {
		return nil, "", err
	}

	return user, token, nil
}

func (s *AuthService) generateToken(user *models.User) (string, error) {
	now := time.Now()

	claims := jwt.MapClaims{
		"user_id": user.ID,
		"role":    user.Role,
		"iat":     now.Unix(),
		"exp":     now.Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return token.SignedString(s.jwtSecret)
}

func normalizeRole(role string) (string, bool) {
	switch strings.ToLower(strings.TrimSpace(role)) {
	case "", "user":
		return "user", true

	case "org", "organization":
		return "organization", true

	case "bank", "waste_bank":
		return "waste_bank", true

	default:
		return "", false
	}
}