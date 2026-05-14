dev:
	@echo "Démarrage du backend et du frontend..."
	@trap 'kill 0' INT; \
	(cd backend && source venv/bin/activate && python manage.py runserver) & \
	(cd frontend && npm run dev) & \
	wait

backend:
	cd backend && source venv/bin/activate && python manage.py runserver

frontend:
	cd frontend && npm run dev

docker-dev:
	docker-compose -f docker-compose.dev.yml up

docker-prod:
	docker-compose up --build

stop:
	@kill $$(lsof -ti:8000,3000) 2>/dev/null || true
	@echo "Serveurs arrêtés."
