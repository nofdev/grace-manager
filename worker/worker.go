// Package worker primary to do the worker interactive with manager throw the socket.io
package worker

type Worker struct {
	ID      string `json:"id"`
	Message string `json:"message"`
	Status  int    `json:"status"`
}

func (w *Worker) Start() string {
	// TODO: Call worker instance
	return ""
}

func (w *Worker) Stop() string {
	// TODO: Stop worker instance
	return ""
}

func (w *Worker) Do() string {
	// TODO: Let worker do something
	return ""
}
