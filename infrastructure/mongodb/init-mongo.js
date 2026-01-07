// MongoDB Initialization Script for LMS AI Assistant
// This script creates collections and indexes for AI-related data

// Switch to the AI database
db = db.getSiblingDB('lms_ai');

print('Initializing MongoDB for LMS AI Assistant...');

// Create collections with validation
db.createCollection('ai_prompt_templates', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['code', 'version', 'system_prompt', 'is_active', 'created_at'],
      properties: {
        code: { bsonType: 'string' },
        version: { bsonType: 'int' },
        system_prompt: { bsonType: 'string' },
        developer_prompt: { bsonType: ['string', 'null'] },
        is_active: { bsonType: 'bool' },
        created_by: { bsonType: ['string', 'null'] },
        created_at: { bsonType: 'date' },
        updated_at: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('ai_sessions', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['user_id', 'session_type', 'started_at'],
      properties: {
        user_id: { bsonType: 'string' },
        session_type: { 
          bsonType: 'string',
          enum: ['chat', 'explain_answer', 'roleplay', 'review_coach']
        },
        related_lesson_id: { bsonType: ['string', 'null'] },
        related_exercise_id: { bsonType: ['string', 'null'] },
        started_at: { bsonType: 'date' },
        ended_at: { bsonType: ['date', 'null'] },
        created_at: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('ai_messages', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['ai_session_id', 'role', 'content_text', 'created_at'],
      properties: {
        ai_session_id: { bsonType: 'objectId' },
        role: { 
          bsonType: 'string',
          enum: ['user', 'assistant', 'system']
        },
        content_text: { bsonType: 'string' },
        created_at: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('ai_invocation_logs', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['ai_session_id', 'model_name', 'status', 'created_at'],
      properties: {
        ai_session_id: { bsonType: 'objectId' },
        template_id: { bsonType: ['objectId', 'null'] },
        model_name: { bsonType: 'string' },
        latency_ms: { bsonType: ['int', 'null'] },
        prompt_tokens: { bsonType: ['int', 'null'] },
        completion_tokens: { bsonType: ['int', 'null'] },
        cost_usd: { bsonType: ['double', 'null'] },
        status: { 
          bsonType: 'string',
          enum: ['success', 'error']
        },
        error_code: { bsonType: ['string', 'null'] },
        created_at: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('ai_feedback', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['ai_message_id', 'user_id', 'rating', 'created_at'],
      properties: {
        ai_message_id: { bsonType: 'objectId' },
        user_id: { bsonType: 'string' },
        rating: { 
          bsonType: 'int',
          minimum: 1,
          maximum: 5
        },
        reason_code: { bsonType: ['string', 'null'] },
        comment: { bsonType: ['string', 'null'] },
        created_at: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('moderation_flags', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['entity_type', 'entity_id', 'flag_type', 'severity', 'status', 'created_at'],
      properties: {
        entity_type: { 
          bsonType: 'string',
          enum: ['ai_message', 'community_post', 'user_profile']
        },
        entity_id: { bsonType: 'string' },
        flag_type: {
          bsonType: 'string',
          enum: ['toxicity', 'sexual', 'self_harm', 'hate', 'pii', 'other']
        },
        severity: { bsonType: 'int' },
        status: {
          bsonType: 'string',
          enum: ['open', 'resolved', 'dismissed']
        },
        created_at: { bsonType: 'date' },
        updated_at: { bsonType: 'date' }
      }
    }
  }
});

print('Creating indexes...');

// AI Prompt Templates
db.ai_prompt_templates.createIndex({ code: 1, version: 1 }, { unique: true });
db.ai_prompt_templates.createIndex({ is_active: 1 });

// AI Sessions
db.ai_sessions.createIndex({ user_id: 1, started_at: -1 });
db.ai_sessions.createIndex({ session_type: 1 });
db.ai_sessions.createIndex({ started_at: -1 });

// AI Messages
db.ai_messages.createIndex({ ai_session_id: 1, created_at: 1 });
db.ai_messages.createIndex({ created_at: -1 });

// AI Invocation Logs
db.ai_invocation_logs.createIndex({ ai_session_id: 1 });
db.ai_invocation_logs.createIndex({ created_at: -1 });
db.ai_invocation_logs.createIndex({ status: 1, created_at: -1 });

// AI Feedback
db.ai_feedback.createIndex({ ai_message_id: 1 });
db.ai_feedback.createIndex({ user_id: 1 });
db.ai_feedback.createIndex({ rating: 1 });

// Moderation Flags
db.moderation_flags.createIndex({ entity_type: 1, entity_id: 1 });
db.moderation_flags.createIndex({ status: 1, created_at: -1 });
db.moderation_flags.createIndex({ severity: -1 });

print('MongoDB initialization completed successfully!');
print('Database: lms_ai');
print('Collections created: 6');
print('Indexes created: 15');
