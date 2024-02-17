---
title: "Functional Options"
date: 2024-02-15T10:29:37-07:00
draft: false
---

By now you're probably aware of functional options, in that they're a nuanced
approach to object configuration that provide flexibility, extensibility and
readability that in my opinion, traditional setters can't match. That said, a
co worker of mine asked why I am using them over traditional setters as they
see most examples just setting a field.

Well let's explore functional options through practical examples, understand
their advantages over traditional setters, and see how they can be composed
and used to enhance testability.

## Understanding Functional Options

Functional options are functions that are used to set specific configurations
to an object. They are passed to an object's constructor function using variadic
arguments to apply the options to the object. The approach allows for a flexibile,
thread-safe way to initialize objects their configuration may be complex or might
involve validation. They allow the configuration of an object via behavior vs
simple field setting and allow for building safe, extensible and pleasent to use APIs.

## Why Functional Options Over Traditional Setters?

Setters are typically called after an object has been created and leaves the object
in a possibly incomplete or invalid state until the setters are called. Some languages
handle this with method overloading of the constructors but even if Go supported this
I still would use functional options instead.

Functional options are applied at construction, ensuring that once an object is created,
it's already in a valid and fully configured state and can encapsulate logic that goes
beyond field assignment while keeping the API stable and readable.

## Examples:
Let's dive into some examples of functional options and how I use them in my day-to-day
code.

### Example 1: Basic Configuration
This basic example shows how an option can be used to change the port number during the
construction of a Server. Yeah, not super fun yet but still...

[Run On Go Playground](https://go.dev/play/p/qp-Fh32Q_sT)

```go
package main

import "fmt"

type Server struct {
    host string
    port int
}

type ServerOption func(*Server)

func WithPort(port int) ServerOption {
    return func(s *Server) {
        s.port = port
    }
}

func NewServer(options ...ServerOption) *Server {
    srv := &Server{host: "localhost", port: 8080}
    for _, option := range options {
        option(srv)
    }
    return srv
}

func main() {
    srv := NewServer(WithPort(3030))
    fmt.Printf("Server running on host %s port %d\n", srv.host, srv.port)
}
```

### Example 2: Composable Configuration
Ok, now this I find super handy at times and hope you do also because in this example
I demonstrate how multiple functional options can be combined into a single,
reusable option that applies a complex configuration with a single function call.

[Run On Go Playground](https://go.dev/play/p/5rVX1TkN4wd)

```go
package main

import (
    "fmt"
    "time"
)

type Server struct {
    protocol       string
    maxConnections int
    timeout        time.Duration
}

type ServerOption func(*Server)

func WithProtocol(protocol string) ServerOption {
    return func(s *Server) {
        s.protocol = protocol
    }
}

func WithMaxConnections(maxConnections int) ServerOption {
    return func(s *Server) {
        s.maxConnections = maxConnections
    }
}

func WithTimeout(timeout time.Duration) ServerOption {
    return func(s *Server) {
        s.timeout = timeout
    }
}

func Compose(opts ...ServerOption) ServerOption {
    return func(s *Server) {
        for _, opt := range opts {
            opt(s)
        }
    }
}

func NewServer(opts ...ServerOption) *Server {
    srv := &Server{
        protocol:       "http",
        maxConnections: 100,
        timeout:        30 * time.Second,
    }
    for _, opt := range opts {
        opt(srv)
    }
    return srv
}

func main() {
    HighPerformance := Compose(WithMaxConnections(1000), WithTimeout(5*time.Second))
    srv := NewServer(HighPerformance, WithProtocol("https"))
    fmt.Printf("Server running with protocol %s, max connections %d, timeout %s\n", srv.protocol, srv.maxConnections, srv.timeout)
}
```

### Example 3: Testability
Now for a testing example using functional options. You should see how a mock
implementation can be injected for testing purposes, without changing the code.

[Run On Go Playground](https://go.dev/play/p/OAc5neyeN8G)

```go
package main

import (
	"fmt"
	"testing"
)

// SessionStore is an interface to interact with the session data.
type SessionStore interface {
	Store(sessionID string, userID int) error
	Retrieve(sessionID string) (int, error)
}

// GameServer holds the session store among other potential fields.
type GameServer struct {
	sessionStore SessionStore
}

// GameServerOption defines a type for functional options for GameServer.
type GameServerOption func(*GameServer)

// WithSessionStore is a functional option that sets the session store for a GameServer.
func WithSessionStore(store SessionStore) GameServerOption {
	return func(gs *GameServer) {
		gs.sessionStore = store
	}
}

// NewGameServer creates a new GameServer with the given options.
func NewGameServer(opts ...GameServerOption) *GameServer {
	gs := &GameServer{}
	for _, opt := range opts {
		opt(gs)
	}
	return gs
}

// MockSessionStore is a mock implementation of SessionStore for testing.
type MockSessionStore struct {
	sessions map[string]int
}

func (m *MockSessionStore) Store(sessionID string, userID int) error {
	m.sessions[sessionID] = userID
	return nil
}

func (m *MockSessionStore) Retrieve(sessionID string) (int, error) {
	userID, ok := m.sessions[sessionID]
	if !ok {
		return 0, fmt.Errorf("session not found")
	}
	return userID, nil
}

// TestGameServerWithMockSessionStore tests the GameServer using a MockSessionStore.
func TestGameServerWithMockSessionStore(t *testing.T) {
	mockStore := &MockSessionStore{sessions: make(map[string]int)}
	gameServer := NewGameServer(WithSessionStore(mockStore))

	// Test storing a session
	testSessionID := "abc123"
	testUserID := 42
	err := gameServer.sessionStore.Store(testSessionID, testUserID)
	if err != nil {
		t.Fatalf("storing session failed: %v", err)
	}

	// Test retrieving a session
	userID, err := gameServer.sessionStore.Retrieve(testSessionID)
	if err != nil {
		t.Fatalf("retrieving session failed: %v", err)
	}
	if userID != testUserID {
		t.Errorf("expected userID %d, got %d", testUserID, userID)
	}
}
```


## Conclusion: Functional Options Rock!!

Functional options are a testament to Go's philosophy of simplicity and clarity.
They provide an elegant solution to object configuration that is both flexible and robust.
By choosing functional options over traditional setters, you gain immutability,
readability, and above all else, clean maintainable code.

What do you use functional options for? Or maybe they're not your cup of tea.
Either way, I'd love to hear your thoughts on the subject!!
