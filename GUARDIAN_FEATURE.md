# Guardian & Emergency Contact Feature

## Overview
Enhanced signup flow with age-based guardian requirements, company HR integration, and emergency contact preferences.

## Features Implemented

### 1. **Multi-Step Signup Process**
- **Step 1**: Basic email and password
- **Step 2**: Detailed profile with emergency contacts

### 2. **Age-Based Requirements**

#### **Users Under 18 (Minors)**
- ✅ Guardian information is **mandatory**
- ✅ Must provide guardian name and phone number
- ✅ Phone must be in international format (+country code)
- ✅ Account type automatically set to "minor"

#### **Users 18+ (Adults)**
Two account types available:
1. **Individual Account**
2. **Company Employee Account**

### 3. **Company Employee Features**
When user selects "Company Employee":
- ✅ Must provide company name
- ✅ Must consent to share SOS alerts with company HR
- ✅ Alerts logged to `company_alerts` collection in Firestore
- ✅ HR can monitor employee mental health emergencies (with consent)

### 4. **Emergency Contact Preferences (Adults)**

#### **Option 1: Guardian/Trusted Contact**
- User can add a guardian or trusted person
- Same fields as minor guardian (name + phone)
- SMS alerts sent during crisis detection

#### **Option 2: Emergency Services (112/911)**
- User consents to Aspira contacting emergency services
- Must explicitly accept terms
- System will call 112 (India) or 911 (US) on their behalf
- Logged in `emergency_alerts` collection

### 5. **Crisis Detection & Alert System**

When AI detects concerning keywords (suicide, self-harm, etc.):

#### **For Minors:**
- ✅ SMS sent to guardian immediately
- ✅ Alert logged in Firestore

#### **For Individual Adults (Guardian Preference):**
- ✅ SMS sent to designated guardian/contact
- ✅ No guardian required if they chose emergency services

#### **For Individual Adults (Emergency Services Preference):**
- ✅ Emergency services contact logged
- ✅ System prepares for 112/911 contact (requires additional API integration)

#### **For Company Employees:**
- ✅ Alert logged for company HR (if consent given)
- ✅ Also sends to personal guardian if configured
- ✅ Dual notification system for workplace support

## Technical Implementation

### Modified Files

#### 1. **`src/login.js`**
- Added multi-step signup form
- Date of birth validation
- Age calculation (determines minor status)
- Account type selection (individual/company)
- Emergency preference selection
- Guardian info collection (conditional)
- Company details (conditional)
- Firestore integration for user profile creation

#### 2. **`api/sendGuardianAlert.js`**
- Enhanced to handle multiple recipient types
- Supports guardian SMS alerts
- Logs company HR alerts
- Emergency services logging
- Multiple alert types in single request
- Better error handling per recipient type

### Firestore Collections

#### **`users` collection:**
```javascript
{
  email: string,
  dateOfBirth: string,
  age: number,
  accountType: "individual" | "company" | "minor",
  emergencyPreference: "guardian" | "emergency_services",
  
  // If guardian/minor
  guardianName?: string,
  guardianPhone?: string,
  
  // If company
  companyName?: string,
  companyHrConsent?: boolean,
  
  // If emergency services
  emergencyServicesConsent?: boolean,
  
  createdAt: timestamp
}
```

#### **`guardian_alerts` collection:**
```javascript
{
  userId: string,
  recipientType: "guardian",
  guardianPhone: string,
  timestamp: timestamp,
  messageSid: string, // Twilio message ID
  status: "sent" | "failed"
}
```

#### **`company_alerts` collection:**
```javascript
{
  userId: string,
  companyName: string,
  timestamp: timestamp,
  type: "company_hr",
  status: "logged",
  message: string
}
```

#### **`emergency_alerts` collection:**
```javascript
{
  userId: string,
  timestamp: timestamp,
  type: "emergency_services",
  status: "logged"
}
```

## Phone Number Format
All phone numbers must use **international format**:
- ✅ Format: `+[country code][number]`
- ✅ India example: `+919876543210`
- ✅ US example: `+15551234567`
- ❌ Invalid: `9876543210` (missing country code)

## SMS Alert Template

### Guardian Alert:
```
⚠️ URGENT ALERT from Aspira

Dear [Guardian Name],

Your ward may need immediate support. They expressed concerning thoughts during a conversation on [timestamp].

Please reach out to them as soon as possible.

If this is an emergency, please contact local crisis helplines:
🇮🇳 India: 9152987821 (iCall)
🇺🇸 US: 988 (Suicide & Crisis Lifeline)

- Aspira Care Team
```

## Privacy & Security
- ✅ Conversation content NOT included in SMS
- ✅ Only timestamp and concern type shared
- ✅ All consents explicitly required
- ✅ Users can update preferences in Settings
- ✅ GDPR/privacy compliant approach

## Future Enhancements
1. **Company HR Portal**: Dashboard for HR to view alerts (with permission)
2. **Emergency Services API**: Direct integration with 112/911 systems
3. **Multi-Guardian Support**: Add multiple emergency contacts
4. **Alert Escalation**: If guardian doesn't respond, escalate to emergency services
5. **Regional Crisis Helplines**: Auto-detect user region and show local helplines

## Testing Checklist
- [ ] Minor signup (under 18) - guardian required
- [ ] Adult signup - individual with guardian preference
- [ ] Adult signup - individual with emergency services preference
- [ ] Adult signup - company employee with HR consent
- [ ] Phone validation (reject invalid formats)
- [ ] Age calculation accuracy
- [ ] SMS delivery to guardian
- [ ] Firestore logging for all alert types
- [ ] Settings page can update guardian info
- [ ] Crisis keyword detection triggers alerts

## Support
For issues or questions:
- Check Firestore collections for alert logs
- Review Twilio console for SMS delivery status
- Check browser console for validation errors
- Verify environment variables (TWILIO_* credentials)
