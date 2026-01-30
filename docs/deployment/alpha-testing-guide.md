# Alpha Testing Guide - Structured Conditions

**Status**: Ready for deployment  
**Date**: 2024-11-02  
**Phase**: Alpha Testing

---

## Overview

This guide walks you through the alpha testing phase for the new structured conditions and NPV calculation features.

---

## Prerequisites

- [x] All migrations applied
- [x] Build successful
- [x] Database access configured
- [ ] Test user accounts created

---

## Step 1: Enable Feature Flags for Internal Team

### Option A: Via SQL

```sql
-- Enable for specific test users
SELECT add_user_to_feature_flag('structured_conditions', 'user-id-1');
SELECT add_user_to_feature_flag('structured_conditions', 'user-id-2');
SELECT add_user_to_feature_flag('npv_calculation', 'user-id-1');
SELECT add_user_to_feature_flag('npv_calculation', 'user-id-2');

-- Or enable globally for testing
UPDATE feature_flags 
SET enabled_globally = true 
WHERE flag_name IN ('structured_conditions', 'npv_calculation');
```

### Option B: Via Rollout Script

```bash
# Enable for internal team users
node scripts/rollout-structured-conditions.mjs

# Check current status
node scripts/rollout-structured-conditions.mjs status
```

---

## Step 2: Test Scenarios

### Scenario 1: Create Offer with Structured Conditions

1. **Login** as a test buyer user
2. **Navigate** to property detail page
3. **Click** "Make Offer"
4. **Fill out** basic offer information (price, payment method, closing date)
5. **Click** "Add Condition"
6. **Select** a condition template (e.g., "Inspection Contingency")
7. **Fill in** condition details
8. **Observe** NPV impact display
9. **Submit** offer
10. **Verify** offer appears in seller's dashboard

**Expected Results:**
- ✅ StructuredConditionsEditor loads correctly
- ✅ NPVCalculatorWidget shows breakdown
- ✅ Condition saved to `offer_conditions` table
- ✅ NPV calculated automatically

### Scenario 2: Accept/Reject Conditions

1. **Login** as seller
2. **Navigate** to negotiation panel
3. **Click** on offer with structured conditions
4. **Review** conditions and NPV breakdown
5. **Accept** one condition
6. **Reject** another condition
7. **Observe** NPV recalculation

**Expected Results:**
- ✅ NPV recalculates when condition status changes
- ✅ Status badges update correctly
- ✅ Progress bar reflects negotiation state
- ✅ Notifications sent to buyer

### Scenario 3: Counteroffer with Lawyer Assignment

1. **Login** as seller
2. **Navigate** to offer detail
3. **Click** "Counteroffer"
4. **Modify** price and add condition
5. **Submit** counteroffer
6. **Verify** lawyer assigned automatically
7. **Check** case created in system

**Expected Results:**
- ✅ Lawyer automatically assigned
- ✅ Case created in `cases` table
- ✅ Notifications sent to lawyer and buyer
- ✅ Structured conditions displayed in counteroffer

### Scenario 4: Migration of Legacy Conditions

1. **Run** migration script:
   ```bash
   node scripts/migrate-legacy-conditions.mjs
   ```
2. **Check** database:
   ```sql
   SELECT * FROM offer_conditions WHERE metadata->>'legacy_text' IS NOT NULL;
   ```
3. **Verify** conditions were parsed correctly

**Expected Results:**
- ✅ Legacy TEXT[] conditions migrated
- ✅ Condition types inferred correctly
- ✅ Original text preserved in metadata
- ✅ No data loss

---

## Step 3: Monitor and Collect Feedback

### Metrics to Track

1. **Performance**
   - NPV calculation time
   - Condition save time
   - Page load times

2. **Errors**
   - Check browser console
   - Monitor Supabase logs
   - Review error tracking

3. **User Feedback**
   - UI/UX feedback form
   - Bug reports
   - Feature requests

### Monitoring Queries

```sql
-- Check feature flag usage
SELECT 
  ff.flag_name,
  COUNT(DISTINCT u.id) as enabled_users,
  (SELECT COUNT(*) FROM profiles) as total_users
FROM feature_flags ff
LEFT JOIN LATERAL unnest(ff.enabled_for_users) AS u(id)
GROUP BY ff.flag_name;

-- Check conditions created
SELECT 
  condition_type,
  status,
  COUNT(*) as count
FROM offer_conditions
GROUP BY condition_type, status
ORDER BY count DESC;

-- Check NPV calculations
SELECT 
  COUNT(*) as total_offers,
  COUNT(calculated_npv) as offers_with_npv,
  AVG(calculated_npv) as avg_npv
FROM offers
WHERE created_at > NOW() - INTERVAL '7 days';
```

---

## Step 4: Rollback if Needed

If critical issues are found:

```bash
# Disable feature flags globally
UPDATE feature_flags 
SET enabled_globally = false, enabled_for_users = '{}'
WHERE flag_name IN ('structured_conditions', 'npv_calculation');

# Or via script
node scripts/rollout-structured-conditions.mjs rollback
```

**Data Safety**: No data will be lost. Legacy conditions will still work.

---

## Success Criteria

- [ ] All test scenarios pass
- [ ] No critical bugs found
- [ ] Performance acceptable (< 500ms for NPV calculation)
- [ ] User feedback positive
- [ ] No data loss or corruption
- [ ] Rollout can proceed to beta

---

## Next Steps

After successful alpha testing:

1. Document all bugs found and fixes applied
2. Update rollout script with lessons learned
3. Prepare beta rollout to 10% of users
4. Set up monitoring dashboards
5. Schedule beta rollout meeting

---

## Support

- **Documentation**: `docs/` directory
- **API Docs**: `docs/api/`
- **Schema Docs**: `docs/database/`
- **Issues**: Create GitHub issue with `alpha-testing` label

