package mock

import (
	"errors"
	"sync"
)

var (
	ErrTransactionNotFound        = errors.New("transaction not found")
	ErrTransactionAlreadyVerified = errors.New("transaction already verified")
)

type User struct {
	ID       string
	Name     string
	Username string
	Role     string
}

type UserStats struct {
	TotalRecycled   float64
	VerifiedActions int
	EcoScore        int
	CampaignJoined  int
	CO2Avoided      float64
}

type Badge struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

type WasteCategory struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Unit        string `json:"unit"`
	Description string `json:"description"`
}

type WasteBank struct {
	ID           string
	Name         string
	Description  string
	Address      string
	Latitude     float64
	Longitude    float64
	Phone        string
	OpeningHours string
	Status       string
	DistanceKM   float64
}

type WasteBankPrice struct {
	WasteCategoryID string
	PricePerKg      int
}

type Campaign struct {
	ID                  string
	Title               string
	OrganizationID      string
	OrganizationName    string
	Description         string
	TargetWeight        float64
	CurrentWeight       float64
	Participants        int
	StartDate           string
	EndDate             string
	Status              string
	PartnerWasteBankIDs []string
}

type Organization struct {
	ID          string
	Name        string
	Description string
}

type TransactionItem struct {
	WasteCategoryID string
	Weight          float64
	UnitPrice       int
	Subtotal        int
}

type Transaction struct {
	ID          string
	UserID      string
	WasteBankID string
	CampaignID  string
	Items       []TransactionItem
	TotalWeight float64
	TotalValue  int
	Status      string
	CreatedAt   string
	VerifiedAt  string
}

var users = []User{
	{
		ID:       "usr_001",
		Name:     "Noval Annur",
		Username: "novalannur",
		Role:     "user",
	},
}

var userStats = map[string]UserStats{
	"usr_001": {
		TotalRecycled:   87.4,
		VerifiedActions: 34,
		EcoScore:        1284,
		CampaignJoined:  7,
		CO2Avoided:      52.6,
	},
}

var userBadges = map[string][]Badge{
	"usr_001": {
		{
			ID:          "badge_first_recycle",
			Name:        "First Recycle",
			Description: "Menyelesaikan aksi daur ulang pertama.",
		},
		{
			ID:          "badge_green_advocate",
			Name:        "Green Advocate",
			Description: "Mencapai eco score di atas 1.000.",
		},
	},
}

var wasteCategories = []WasteCategory{
	{ID: "cat_pet", Name: "PET Plastic", Unit: "kg", Description: "Botol dan kemasan plastik PET bersih."},
	{ID: "cat_paper", Name: "Paper", Unit: "kg", Description: "Kertas bekas yang bersih dan kering."},
	{ID: "cat_metal", Name: "Metal", Unit: "kg", Description: "Kaleng dan material logam yang dapat didaur ulang."},
	{ID: "cat_cardboard", Name: "Cardboard", Unit: "kg", Description: "Kardus bekas yang bersih dan kering."},
	{ID: "cat_glass", Name: "Glass", Unit: "kg", Description: "Botol dan wadah kaca tanpa kontaminasi."},
}

var wasteBanks = []WasteBank{
	{
		ID:           "wb_001",
		Name:         "EcoHub Purwokerto",
		Description:  "Bank sampah yang menerima berbagai material daur ulang.",
		Address:      "Purwokerto, Banyumas, Jawa Tengah",
		Latitude:     -7.42,
		Longitude:    109.24,
		Phone:        "0812-3456-7890",
		OpeningHours: "Senin-Sabtu, 08:00-16:00",
		Status:       "open",
		DistanceKM:   1.4,
	},
	{
		ID:           "wb_002",
		Name:         "Bank Sampah Hijau Bersama",
		Description:  "Bank sampah komunitas untuk warga Banyumas.",
		Address:      "Banyumas, Jawa Tengah",
		Latitude:     -7.43,
		Longitude:    109.25,
		Phone:        "0813-9876-5432",
		OpeningHours: "Senin-Jumat, 08:00-15:00",
		Status:       "open",
		DistanceKM:   2.7,
	},
}

var wasteBankPrices = map[string][]WasteBankPrice{
	"wb_001": {
		{WasteCategoryID: "cat_pet", PricePerKg: 3500},
		{WasteCategoryID: "cat_paper", PricePerKg: 2000},
		{WasteCategoryID: "cat_metal", PricePerKg: 8000},
		{WasteCategoryID: "cat_cardboard", PricePerKg: 2500},
		{WasteCategoryID: "cat_glass", PricePerKg: 1500},
	},
	"wb_002": {
		{WasteCategoryID: "cat_pet", PricePerKg: 3500},
		{WasteCategoryID: "cat_paper", PricePerKg: 2000},
		{WasteCategoryID: "cat_metal", PricePerKg: 8000},
		{WasteCategoryID: "cat_cardboard", PricePerKg: 2500},
		{WasteCategoryID: "cat_glass", PricePerKg: 1500},
	},
}

var organizations = []Organization{
	{
		ID:          "org_001",
		Name:        "BEM Telkom University",
		Description: "Organisasi mahasiswa yang menginisiasi aksi lingkungan kampus.",
	},
}

var campaigns = []Campaign{
	{
		ID:                  "cmp_001",
		Title:               "Plastic Free Campus",
		OrganizationID:      "org_001",
		OrganizationName:    "BEM Telkom University",
		Description:         "Campaign pengurangan sampah plastik di lingkungan kampus",
		TargetWeight:        1000,
		CurrentWeight:       684,
		Participants:        421,
		StartDate:           "2026-10-01",
		EndDate:             "2026-10-31",
		Status:              "active",
		PartnerWasteBankIDs: []string{"wb_001", "wb_002"},
	},
	{
		ID:                  "cmp_002",
		Title:               "Zero Waste Neighborhood",
		OrganizationName:    "Eco Community Banyumas",
		Description:         "Gerakan warga untuk mengurangi sampah rumah tangga.",
		TargetWeight:        500,
		CurrentWeight:       230,
		Participants:        128,
		StartDate:           "2026-09-01",
		EndDate:             "2026-11-30",
		Status:              "active",
		PartnerWasteBankIDs: []string{"wb_002"},
	},
}

var (
	transactionsMutex sync.RWMutex
	transactions      = []Transaction{
		{
			ID:          "trx_001",
			UserID:      "usr_001",
			WasteBankID: "wb_001",
			CampaignID:  "cmp_001",
			Items: []TransactionItem{
				{WasteCategoryID: "cat_pet", Weight: 2.8, UnitPrice: 3500, Subtotal: 9800},
			},
			TotalWeight: 2.8,
			TotalValue:  9800,
			Status:      "pending",
			CreatedAt:   "2026-09-18T16:45:00+07:00",
		},
		{
			ID:          "trx_002",
			UserID:      "usr_001",
			WasteBankID: "wb_002",
			Items: []TransactionItem{
				{WasteCategoryID: "cat_paper", Weight: 4.5, UnitPrice: 2000, Subtotal: 9000},
			},
			TotalWeight: 4.5,
			TotalValue:  9000,
			Status:      "verified",
			CreatedAt:   "2026-09-12T10:00:00+07:00",
			VerifiedAt:  "2026-09-12T10:30:00+07:00",
		},
		{
			ID:          "trx_003",
			UserID:      "usr_001",
			WasteBankID: "wb_001",
			CampaignID:  "cmp_002",
			Items: []TransactionItem{
				{WasteCategoryID: "cat_metal", Weight: 1.2, UnitPrice: 8000, Subtotal: 9600},
			},
			TotalWeight: 1.2,
			TotalValue:  9600,
			Status:      "verified",
			CreatedAt:   "2026-09-05T13:45:00+07:00",
			VerifiedAt:  "2026-09-05T14:15:00+07:00",
		},
		{
			ID:          "trx_004",
			UserID:      "usr_001",
			WasteBankID: "wb_001",
			CampaignID:  "cmp_001",
			Items: []TransactionItem{
				{WasteCategoryID: "cat_pet", Weight: 2.8, UnitPrice: 3500, Subtotal: 9800},
			},
			TotalWeight: 2.8,
			TotalValue:  9800,
			Status:      "verified",
			CreatedAt:   "2026-08-28T16:30:00+07:00",
			VerifiedAt:  "2026-08-28T17:00:00+07:00",
		},
	}
)

func GetUser(id string) (User, bool) {
	for _, user := range users {
		if user.ID == id {
			return user, true
		}
	}
	return User{}, false
}

func GetUserStats(id string) (UserStats, bool) {
	stats, found := userStats[id]
	return stats, found
}

func GetUserBadges(id string) []Badge {
	return append([]Badge(nil), userBadges[id]...)
}

func ListWasteCategories() []WasteCategory {
	return append([]WasteCategory(nil), wasteCategories...)
}

func GetWasteCategory(id string) (WasteCategory, bool) {
	for _, category := range wasteCategories {
		if category.ID == id {
			return category, true
		}
	}
	return WasteCategory{}, false
}

func ListWasteBanks() []WasteBank {
	return append([]WasteBank(nil), wasteBanks...)
}

func GetWasteBank(id string) (WasteBank, bool) {
	for _, wasteBank := range wasteBanks {
		if wasteBank.ID == id {
			return wasteBank, true
		}
	}
	return WasteBank{}, false
}

func GetWasteBankPrices(id string) ([]WasteBankPrice, bool) {
	prices, found := wasteBankPrices[id]
	if !found {
		return nil, false
	}
	return append([]WasteBankPrice(nil), prices...), true
}

func GetWasteBankPrice(wasteBankID, categoryID string) (int, bool) {
	prices, found := wasteBankPrices[wasteBankID]
	if !found {
		return 0, false
	}
	for _, price := range prices {
		if price.WasteCategoryID == categoryID {
			return price.PricePerKg, true
		}
	}
	return 0, false
}

func ListCampaigns() []Campaign {
	return append([]Campaign(nil), campaigns...)
}

func GetCampaign(id string) (Campaign, bool) {
	for _, campaign := range campaigns {
		if campaign.ID == id {
			return campaign, true
		}
	}
	return Campaign{}, false
}

func GetOrganization(id string) (Organization, bool) {
	for _, organization := range organizations {
		if organization.ID == id {
			return organization, true
		}
	}
	return Organization{}, false
}

func ListOrganizationCampaigns(organizationID string) []Campaign {
	result := make([]Campaign, 0)
	for _, campaign := range campaigns {
		if campaign.OrganizationID == organizationID {
			result = append(result, campaign)
		}
	}
	return result
}

func GetTransaction(id string) (Transaction, bool) {
	transactionsMutex.RLock()
	defer transactionsMutex.RUnlock()

	for _, transaction := range transactions {
		if transaction.ID == id {
			return transaction, true
		}
	}
	return Transaction{}, false
}

func ListUserTransactions(userID, status string) []Transaction {
	transactionsMutex.RLock()
	defer transactionsMutex.RUnlock()

	result := make([]Transaction, 0)
	for _, transaction := range transactions {
		if transaction.UserID != userID {
			continue
		}
		if status != "" && transaction.Status != status {
			continue
		}
		result = append(result, transaction)
	}
	return result
}

func VerifyTransaction(id, verifiedAt string) (Transaction, error) {
	transactionsMutex.Lock()
	defer transactionsMutex.Unlock()

	for index := range transactions {
		if transactions[index].ID != id {
			continue
		}
		if transactions[index].Status == "verified" {
			return Transaction{}, ErrTransactionAlreadyVerified
		}
		transactions[index].Status = "verified"
		transactions[index].VerifiedAt = verifiedAt
		return transactions[index], nil
	}

	return Transaction{}, ErrTransactionNotFound
}
