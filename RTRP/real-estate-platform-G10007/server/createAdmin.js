const supabase = require('./config/supabase');
const bcrypt = require('bcryptjs');

async function createAdmin() {
    try {
        const { data: existingAdmin } = await supabase
            .from('users')
            .select('id')
            .eq('username', 'admin')
            .single();

        if (existingAdmin) {
            console.log("Admin user already exists. Username: admin");
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        
        const { error } = await supabase.from('users').insert([{
            username: 'admin',
            email: 'admin@urbanova.com',
            password: hashedPassword,
            role: 'admin'
        }]);

        if (error) throw error;
        
        console.log("Admin created successfully!");
    } catch (err) {
        console.error(err);
    }
}
createAdmin();
