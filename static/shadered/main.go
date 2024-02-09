package main

import (
	"log"
	"net/http"
	"path/filepath"
)

func main() {
	// Define the directory to serve.
	const staticFilesDir = "./"
	const port = "8080"

	// Setup route to serve static files.
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Generate the absolute path of the static directory.
		absPath, err := filepath.Abs(staticFilesDir)
		if err != nil {
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			log.Printf("Error generating absolute path: %v", err)
			return
		}

		// Serve the file directly using http.ServeFile.
		path := filepath.Join(absPath, r.URL.Path)
		http.ServeFile(w, r, path)
	})

	// Start the server.
	address := ":" + port
	log.Printf("Serving %s on HTTP port: %s\n", staticFilesDir, port)
	if err := http.ListenAndServe(address, nil); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
