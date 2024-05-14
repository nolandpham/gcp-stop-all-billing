# Technologies:
**1. Google cloud platform:**
  + Cloud function gen1
  + Pub/Sub

# How to deploy cloud function:
```bash
export PROJECT_ID="<project-id>"
# export PUBSUB_TOPIC="<topic-name>"
export PUBSUB_TOPIC="cost-alert"

gcloud auth application-default login
gcloud config set project $PROJECT_ID

gcloud pubsub topics create $PUBSUB_TOPIC

# deploy
gcloud functions deploy stop-all-billing \
  --region=us-central1 \
  --runtime=nodejs20 \
  --source=. \
  --entry-point=stopBilling \
  --trigger-topic=$PUBSUB_TOPIC \
  --set-env-vars GOOGLE_CLOUD_PROJECT=$PROJECT_ID \
  --max-instances=1 \
  --memory=128MB
```

# How to test:
```bash
gcloud pubsub topics publish "projects/$PROJECT_ID/topics/$PUBSUB_TOPIC" \
  --message '{"data": "eyJjb3N0QW1vdW50IjoxMDAsImJ1ZGdldEFtb3VudCI6MjAwICB9"}'
```
