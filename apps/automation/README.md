# Automation (n8n)

Week 5 deliverable. Placeholder for n8n workflow templates.

## Planned Workflows

- Lead auto-assignment on creation
- WhatsApp follow-up reminders
- Email drip sequences
- Deal stage change notifications
- Daily task digest

## Running n8n

```bash
# From project root — includes n8n service
docker compose -f docker/docker-compose.yml --profile automation up -d n8n
```

Access: http://localhost:5678

## Integration Points

Backend will expose webhook endpoints (Week 5) for n8n to call:

- `POST /api/v1/webhooks/n8n/lead-created`
- `POST /api/v1/webhooks/n8n/task-reminder`
