# Firebase Cloud Functions - Lembretes de Consultas

Este diretório contém as Cloud Functions do Firebase para envio automático de notificações de lembrete de consultas.

## Estrutura

```
firebase-functions/
├── src/
│   ├── index.ts              # Entry point
│   ├── sendReminders.ts      # Função de envio de lembretes
│   └── types.ts              # Tipos TypeScript
├── package.json
├── tsconfig.json
└── README.md
```

## Configuração

### 1. Inicializar Firebase Functions no seu projeto

```bash
# No diretório raiz do seu projeto Firebase
firebase init functions
```

### 2. Copiar os arquivos

Copie o conteúdo da pasta `firebase-functions/src/` para a pasta `functions/src/` do seu projeto Firebase.

### 3. Instalar dependências

```bash
cd functions
npm install firebase-admin firebase-functions
```

### 4. Configurar variáveis de ambiente

```bash
firebase functions:config:set app.url="https://seu-dominio.com"
```

### 5. Deploy

```bash
firebase deploy --only functions
```

## Funções Disponíveis

### `sendAppointmentReminders`
- **Trigger:** Executa a cada 15 minutos (cron)
- **Descrição:** Verifica consultas próximas e envia notificações push

### `sendReminderNotification` (HTTP)
- **Trigger:** Requisição HTTP
- **Descrição:** Endpoint para enviar notificação manual

## Estrutura do Firestore

A função espera as seguintes coleções:

### `appointments`
```json
{
  "patientId": "string",
  "patientName": "string",
  "date": "2024-01-20",
  "time": "14:00",
  "status": "scheduled",
  "reminderSent1h": false,
  "reminderSent24h": false
}
```

### `userNotifications`
```json
{
  "userId": "string",
  "tokens": ["fcm_token_1", "fcm_token_2"],
  "enabled": true,
  "appointmentReminders": true,
  "reminderTiming": "both" // "1h" | "24h" | "both"
}
```

## Logs

Visualize os logs no Firebase Console ou via CLI:

```bash
firebase functions:log
```
