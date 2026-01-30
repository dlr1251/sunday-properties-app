/**
 * Migration script to convert legacy TEXT[] conditions to structured offer_conditions
 * 
 * This script:
 * 1. Reads all offers with legacy conditions
 * 2. Parses and converts them to structured format
 * 3. Creates offer_conditions records
 * 4. Preserves original data for reference
 * 
 * Run with: node scripts/migrate-legacy-conditions.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Parse a legacy condition text into a structured condition
 */
function parseCondition(conditionText) {
  if (!conditionText || typeof conditionText !== 'string') {
    return null;
  }

  const text = conditionText.toLowerCase().trim();
  
  // Inspection contingency
  if (text.includes('inspección') || text.includes('inspection')) {
    return {
      type: 'inspection_contingency',
      key: 'inspection_contingency',
      value: { 
        description: conditionText, 
        required: true,
        days: extractDays(conditionText) || 15
      },
      displayText: conditionText
    };
  }
  
  // Financing contingency
  if (text.includes('financiación') || text.includes('financing') || text.includes('aprobación')) {
    return {
      type: 'financing_contingency',
      key: 'financing_contingency',
      value: { 
        description: conditionText, 
        required: true,
        days: extractDays(conditionText) || 30
      },
      displayText: conditionText
    };
  }
  
  // Appraisal contingency
  if (text.includes('avalúo') || text.includes('appraisal') || text.includes('tasación')) {
    return {
      type: 'appraisal_contingency',
      key: 'appraisal_contingency',
      value: { 
        description: conditionText, 
        required: true,
        days: extractDays(conditionText) || 21
      },
      displayText: conditionText
    };
  }
  
  // Title contingency
  if (text.includes('título') || text.includes('title') || text.includes('estudio') || text.includes('libertad')) {
    return {
      type: 'title_contingency',
      key: 'title_contingency',
      value: { 
        description: conditionText, 
        required: true,
        days: extractDays(conditionText) || 30
      },
      displayText: conditionText
    };
  }
  
  // Repairs required
  if (text.includes('reparación') || text.includes('repair') || text.includes('arreglo')) {
    const cost = extractCost(conditionText);
    return {
      type: 'repairs_required',
      key: 'repairs_required',
      value: { 
        description: conditionText,
        estimated_cost: cost || null
      },
      displayText: conditionText
    };
  }
  
  // Appliances included
  if (text.includes('electrodoméstico') || text.includes('appliance') || text.includes('equipamiento')) {
    return {
      type: 'appliances_included',
      key: 'appliances_included',
      value: { 
        description: conditionText
      },
      displayText: conditionText
    };
  }
  
  // Notary costs distribution
  if (text.includes('notaría') || text.includes('notary') || text.includes('honorario')) {
    const percentage = extractPercentage(conditionText);
    return {
      type: 'notary_costs_distribution',
      key: 'notary_costs_distribution',
      value: { 
        buyer_percentage: percentage || 50,
        seller_percentage: 100 - (percentage || 50),
        description: conditionText
      },
      displayText: conditionText
    };
  }
  
  // Delivery date (handled separately as it's usually in closing_date field)
  if (text.includes('entrega') || text.includes('delivery')) {
    const date = extractDate(conditionText);
    return {
      type: 'delivery_date',
      key: 'delivery_date',
      value: { 
        date: date || null,
        description: conditionText
      },
      displayText: conditionText
    };
  }
  
  // Default: custom condition
  return {
    type: 'custom',
    key: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    value: { 
      description: conditionText
    },
    displayText: conditionText
  };
}

/**
 * Extract number of days from text
 */
function extractDays(text) {
  const match = text.match(/(\d+)\s*(día|dias|day|days)/i);
  return match ? parseInt(match[1]) : null;
}

/**
 * Extract cost amount from text
 */
function extractCost(text) {
  // Look for common currency patterns
  const match = text.match(/(\$|cop|usd)\s*(\d{1,3}(?:\.\d{3})*(?:,\d+)?)/i);
  if (match) {
    return parseFloat(match[2].replace(/\./g, '').replace(',', '.'));
  }
  return null;
}

/**
 * Extract percentage from text
 */
function extractPercentage(text) {
  const match = text.match(/(\d+)%/);
  return match ? parseInt(match[1]) : null;
}

/**
 * Extract date from text
 */
function extractDate(text) {
  // Look for common date patterns
  const datePatterns = [
    /\d{1,2}\/\d{1,2}\/\d{4}/,
    /\d{1,2}-\d{1,2}-\d{4}/,
    /\d{4}-\d{1,2}-\d{1,2}/
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0];
    }
  }
  
  return null;
}

/**
 * Main migration function
 */
async function migrateLegacyConditions() {
  console.log('🚀 Starting migration of legacy conditions...');
  
  try {
    // Get all offers with legacy conditions
    const { data: offers, error } = await supabase
      .from('offers')
      .select('id, conditions, buyer_id, property_id, created_at')
      .not('conditions', 'is', null);
    
    if (error) {
      throw error;
    }
  
    if (!offers || offers.length === 0) {
      console.log('✅ No offers with legacy conditions found');
      return;
    }
  
    console.log(`📊 Found ${offers.length} offers with legacy conditions`);
    
    let migratedCount = 0;
    let errorCount = 0;
    
    // Process each offer
    for (const offer of offers) {
      if (!offer.conditions || !Array.isArray(offer.conditions) || offer.conditions.length === 0) {
        continue;
      }
      
      console.log(`\n📝 Processing offer ${offer.id} (${offer.conditions.length} conditions)`);
      
      // Parse and create structured conditions for each legacy condition
      for (const conditionText of offer.conditions) {
        if (!conditionText || typeof conditionText !== 'string') {
          continue;
        }
        
        const structuredCondition = parseCondition(conditionText);
        
        if (!structuredCondition) {
          console.warn(`  ⚠️  Could not parse condition: ${conditionText}`);
          continue;
        }
        
        const { error: insertError } = await supabase
          .from('offer_conditions')
          .insert({
            offer_id: offer.id,
            condition_type: structuredCondition.type,
            condition_key: structuredCondition.key,
            condition_value: structuredCondition.value,
            condition_display_text: structuredCondition.displayText,
            status: 'accepted', // Legacy conditions are implicitly accepted
            proposed_by: 'buyer',
            proposer_user_id: offer.buyer_id,
            version: 1
          });
        
        if (insertError) {
          console.error(`  ❌ Error migrating condition: ${conditionText}`, insertError.message);
          errorCount++;
        } else {
          console.log(`  ✅ Migrated: ${structuredCondition.type} - ${structuredCondition.displayText.substring(0, 50)}...`);
          migratedCount++;
        }
      }
    }
    
    console.log('\n🎉 Migration complete!');
    console.log(`   ✅ Migrated: ${migratedCount} conditions`);
    console.log(`   ❌ Errors: ${errorCount} conditions`);
    
  } catch (error) {
    console.error('❌ Fatal error during migration:', error);
    process.exit(1);
  }
}

/**
 * Validate the migration
 */
async function validateMigration() {
  console.log('\n🔍 Validating migration...');
  
  try {
    // Get all offers with legacy conditions
    const { data: offers } = await supabase
      .from('offers')
      .select('id, conditions')
      .not('conditions', 'is', null);
    
    if (!offers || offers.length === 0) {
      console.log('✅ No legacy conditions to validate');
      return;
    }
    
    for (const offer of offers) {
      if (!offer.conditions || !Array.isArray(offer.conditions) || offer.conditions.length === 0) {
        continue;
      }
      
      // Check if structured conditions exist
      const { data: structuredConditions } = await supabase
        .from('offer_conditions')
        .select('id')
        .eq('offer_id', offer.id);
      
      if (!structuredConditions || structuredConditions.length < offer.conditions.length) {
        console.warn(`⚠️  Offer ${offer.id}: ${offer.conditions.length} legacy, ${structuredConditions?.length || 0} structured`);
      }
    }
    
    console.log('✅ Validation complete');
    
  } catch (error) {
    console.error('❌ Validation error:', error);
  }
}

// Run migration
async function main() {
  console.log('='.repeat(60));
  console.log('LEGACY CONDITIONS MIGRATION');
  console.log('='.repeat(60));
  
  await migrateLegacyConditions();
  await validateMigration();
  
  console.log('='.repeat(60));
  console.log('Done!');
  console.log('='.repeat(60));
}

// Execute
main().catch(console.error);

