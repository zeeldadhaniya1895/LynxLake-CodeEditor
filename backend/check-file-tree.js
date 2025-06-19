const pool = require('./db');

const checkFileTree = async () => {
  try {
    console.log('🔍 Checking file tree in database...\n');

    // Check file_tree table
    console.log('📁 File Tree Table:');
    const fileTreeResult = await pool.query(`
      SELECT id, name, type, parent_id, project_id, is_expanded, created_at, updated_at
      FROM file_tree
      ORDER BY name ASC
    `);
    
    console.log(`Found ${fileTreeResult.rows.length} items in file_tree table:`);
    fileTreeResult.rows.forEach((item, index) => {
      console.log(`${index + 1}. ${item.type.toUpperCase()}: ${item.name} (ID: ${item.id})`);
      console.log(`   Project: ${item.project_id}`);
      console.log(`   Parent: ${item.parent_id || 'Root'}`);
      console.log(`   Expanded: ${item.is_expanded}`);
      console.log('');
    });

    // Check files table
    console.log('📄 Files Table:');
    const filesResult = await pool.query(`
      SELECT id, name, content, project_id, created_at, updated_at
      FROM files
      ORDER BY name ASC
    `);
    
    console.log(`Found ${filesResult.rows.length} items in files table:`);
    filesResult.rows.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} (ID: ${item.id})`);
      console.log(`   Project: ${item.project_id}`);
      console.log(`   Content length: ${item.content?.length || 0} characters`);
      console.log('');
    });

    // Check specific project
    const projectId = '54337a61-8a72-4ad0-97cd-b56e466a32b4';
    console.log(`🎯 Checking specific project: ${projectId}`);
    
    const projectFileTree = await pool.query(`
      SELECT id, name, type, parent_id, is_expanded
      FROM file_tree
      WHERE project_id = $1
      ORDER BY name ASC
    `, [projectId]);
    
    console.log(`Found ${projectFileTree.rows.length} items for project ${projectId}:`);
    projectFileTree.rows.forEach((item, index) => {
      console.log(`${index + 1}. ${item.type.toUpperCase()}: ${item.name} (ID: ${item.id})`);
      console.log(`   Parent: ${item.parent_id || 'Root'}`);
      console.log(`   Expanded: ${item.is_expanded}`);
    });

  } catch (error) {
    console.error('❌ Error checking file tree:', error);
  } finally {
    await pool.end();
  }
};

checkFileTree(); 