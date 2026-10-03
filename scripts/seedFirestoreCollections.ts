import { seedAllFirestoreCollections, ALL_SEEDS } from '../src/services/firestoreSeedService';

async function runSeed() {
  console.log('===============================================================');
  console.log('🚀 CRESCO CN - FIRESTORE 15-COLLECTION SEED & SYNC UTILITY');
  console.log('===============================================================');
  console.log('Target Collections:');
  Object.keys(ALL_SEEDS).forEach((name, i) => {
    console.log(`  ${(i + 1).toString().padStart(2, ' ')}. ${name} (${ALL_SEEDS[name].docs.length} initial items)`);
  });
  console.log('---------------------------------------------------------------\n');

  const startTime = Date.now();

  try {
    const result = await seedAllFirestoreCollections({
      overwrite: true,
      onProgress: (collection, current, total, status, error) => {
        if (status === 'error') {
          console.error(`  ❌ [${collection}] Error on item ${current}/${total}: ${error}`);
        } else if (status === 'done') {
          console.log(`  ✅ [${collection.padEnd(14, ' ')}] Successfully synced ${total} documents.`);
        }
      }
    });

    const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n===============================================================');
    console.log(`🎉 SEED COMPLETE in ${elapsedSeconds}s!`);
    console.log(`   Total Documents Processed/Updated: ${result.seededCount}`);
    console.log(`   Errors Encountered: ${result.errors.length}`);
    if (result.errors.length > 0) {
      console.warn('   Errors breakdown:', result.errors);
    }
    console.log('===============================================================');

    process.exit(result.errors.length > 0 ? 1 : 0);
  } catch (fatalError) {
    console.error('💥 Fatal Seeder Failure:', fatalError);
    process.exit(1);
  }
}

runSeed();
