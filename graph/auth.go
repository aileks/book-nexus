package graph

import (
	"context"
	"errors"
	"os"
)

type contextKey string

const adminAuthKey contextKey = "isAdmin"

var ErrUnauthorized = errors.New("unauthorized: admin access required")

// IsAdmin checks if the current request has admin privileges
func IsAdmin(ctx context.Context) bool {
	val, ok := ctx.Value(adminAuthKey).(bool)
	return ok && val
}

// WithAdminAuth adds admin authentication status to context
func WithAdminAuth(ctx context.Context, password string) context.Context {
	adminPassword := os.Getenv("ADMIN_PASSWORD")
	if adminPassword == "" {
		// No admin password configured, deny all admin access
		return context.WithValue(ctx, adminAuthKey, false)
	}
	isAdmin := password == adminPassword
	return context.WithValue(ctx, adminAuthKey, isAdmin)
}

// RequireAdmin returns an error if the request is not authenticated as admin
func RequireAdmin(ctx context.Context) error {
	if !IsAdmin(ctx) {
		return ErrUnauthorized
	}
	return nil
}
