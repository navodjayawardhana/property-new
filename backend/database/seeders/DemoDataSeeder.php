<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        // ── 1. Agents ─────────────────────────────────────────────────────────
        $agents = [
            ['name' => 'Nuwan Perera',      'email' => 'nuwan.perera@greenbrick.lk',    'suburb' => 'Colombo 3',    'state' => 'Western',       'bio' => 'Specialising in luxury apartments and commercial properties in Colombo for over 12 years.'],
            ['name' => 'Chamari Silva',     'email' => 'chamari.silva@greenbrick.lk',   'suburb' => 'Kandy',        'state' => 'Central',       'bio' => 'Award-winning agent with deep knowledge of Central Province properties and hill country estates.'],
            ['name' => 'Roshan Fernando',   'email' => 'roshan.fernando@greenbrick.lk', 'suburb' => 'Galle',        'state' => 'Southern',      'bio' => 'Coastal property expert helping buyers find their perfect beach home or investment in the South.'],
            ['name' => 'Priya Wickrama',    'email' => 'priya.wickrama@greenbrick.lk',  'suburb' => 'Negombo',      'state' => 'Western',       'bio' => 'Residential specialist with 8 years of experience in Western Province and airport corridor developments.'],
            ['name' => 'Dinesh Rajapaksa',  'email' => 'dinesh.rajapaksa@greenbrick.lk','suburb' => 'Nugegoda',     'state' => 'Western',       'bio' => 'Top-performing agent focused on suburban family homes and investment properties in greater Colombo.'],
            ['name' => 'Sanduni Mendis',    'email' => 'sanduni.mendis@greenbrick.lk',  'suburb' => 'Kurunegala',   'state' => 'North Western', 'bio' => 'Dedicated to helping first-home buyers navigate the North Western Province property market.'],
            ['name' => 'Kasun Bandara',     'email' => 'kasun.bandara@greenbrick.lk',   'suburb' => 'Anuradhapura', 'state' => 'North Central', 'bio' => 'Heritage city specialist with expertise in both residential and agricultural land transactions.'],
            ['name' => 'Nimesha Jayawardena','email' => 'nimesha.jaya@greenbrick.lk',  'suburb' => 'Matara',       'state' => 'Southern',      'bio' => 'Passionate about connecting families with their dream homes along Sri Lanka\'s stunning southern coast.'],
            ['name' => 'Tharaka Gunasekara','email' => 'tharaka.guna@greenbrick.lk',   'suburb' => 'Trincomalee',  'state' => 'Eastern',       'bio' => 'Eastern Province property specialist with insider knowledge of coastal and heritage property markets.'],
            ['name' => 'Amali Dissanayake', 'email' => 'amali.dissa@greenbrick.lk',    'suburb' => 'Ratnapura',    'state' => 'Sabaragamuwa',  'bio' => 'Gem-city real estate expert helping investors and families find value in Sabaragamuwa Province.'],
            ['name' => 'Sachith Karunaratne','email' => 'sachith.karu@greenbrick.lk',  'suburb' => 'Colombo 7',    'state' => 'Western',       'bio' => 'Premium property consultant specialising in Colombo 7 luxury homes, penthouses, and high-end rentals.'],
            ['name' => 'Dilini Samarasinghe','email' => 'dilini.sama@greenbrick.lk',   'suburb' => 'Badulla',      'state' => 'Uva',           'bio' => 'Uva Province expert helping tea estate investors and eco-retreat developers find the right land.'],
        ];

        $agentAvatars = [
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
        ];

        $agentIds = [];
        foreach ($agents as $i => $agent) {
            $slug = Str::slug($agent['name']) . '-' . ($i + 100);
            $exists = DB::table('users')->where('email', $agent['email'])->first();
            if ($exists) {
                $agentIds[] = $exists->id;
                continue;
            }
            $id = DB::table('users')->insertGetId([
                'name'              => $agent['name'],
                'email'             => $agent['email'],
                'password'          => Hash::make('password123'),
                'role'              => 'agent',
                'avatar'            => $agentAvatars[$i % count($agentAvatars)],
                'bio'               => $agent['bio'],
                'suburb'            => $agent['suburb'],
                'state'             => $agent['state'],
                'country'           => 'Sri Lanka',
                'phone'             => '+94' . rand(700000000, 779999999),
                'slug'              => $slug,
                'email_verified_at' => $now,
                'created_at'        => $now,
                'updated_at'        => $now,
            ]);
            $agentIds[] = $id;
        }

        // ── 2. Agent slides ───────────────────────────────────────────────────
        $agentSlideImages = [
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
            'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
            'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80',
        ];

        foreach (array_slice($agentIds, 0, 4) as $idx => $agentId) {
            $already = DB::table('agent_slides')->where('user_id', $agentId)->exists();
            if ($already) continue;
            foreach (array_slice($agentSlideImages, 0, 3) as $si => $img) {
                DB::table('agent_slides')->insert([
                    'user_id'    => $agentId,
                    'image_path' => $img,
                    'sort_order' => $si,
                    'is_active'  => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        // ── 3. Homepage slides ────────────────────────────────────────────────
        if (DB::table('slides')->count() === 0) {
            $slides = [
                ['title' => 'Find Your Dream Home',         'subtitle' => 'Browse thousands of properties across Sri Lanka',         'img' => 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&q=80'],
                ['title' => 'Premium Colombo Residences',   'subtitle' => 'Luxury apartments and houses in the heart of the city',   'img' => 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1400&q=80'],
                ['title' => 'Coastal Living Awaits',        'subtitle' => 'Stunning beachfront homes from Galle to Trincomalee',     'img' => 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1400&q=80'],
                ['title' => 'Hill Country Escapes',         'subtitle' => 'Serene homes and estates in Kandy and Nuwara Eliya',      'img' => 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=80'],
                ['title' => 'New Developments',             'subtitle' => 'Be the first to live in brand-new properties island-wide', 'img' => 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=80'],
            ];
            foreach ($slides as $i => $s) {
                DB::table('slides')->insert([
                    'title'      => $s['title'],
                    'subtitle'   => $s['subtitle'],
                    'media_type' => 'image',
                    'media_path' => $s['img'],
                    'sort_order' => $i,
                    'is_active'  => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        // ── 4. Bank loan rates ────────────────────────────────────────────────
        if (DB::table('bank_loan_rates')->count() === 0) {
            $banks = [
                ['bank_name' => 'Bank of Ceylon',           'loan_type' => 'variable',      'interest_rate' => 11.50, 'min_loan' => 1000000,  'max_loan' => 100000000, 'features' => ['No early repayment fee', 'Flexible repayment', 'Up to 30-year term']],
                ['bank_name' => 'People\'s Bank',           'loan_type' => 'fixed',         'interest_rate' => 10.75, 'min_loan' => 500000,   'max_loan' => 75000000,  'features' => ['Fixed rate for 5 years', 'Government-backed', 'Low processing fee']],
                ['bank_name' => 'Commercial Bank',          'loan_type' => 'variable',      'interest_rate' => 12.00, 'min_loan' => 1000000,  'max_loan' => 150000000, 'features' => ['Quick approval', 'Online account management', 'Offset account available']],
                ['bank_name' => 'Hatton National Bank',     'loan_type' => 'split',         'interest_rate' => 11.25, 'min_loan' => 2000000,  'max_loan' => 200000000, 'features' => ['Split fixed/variable', 'Priority service', 'Dedicated home loan manager']],
                ['bank_name' => 'Sampath Bank',             'loan_type' => 'variable',      'interest_rate' => 12.50, 'min_loan' => 500000,   'max_loan' => 80000000,  'features' => ['Low minimum loan', 'Digital application', 'Fast disbursement']],
                ['bank_name' => 'Nations Trust Bank',       'loan_type' => 'fixed',         'interest_rate' => 11.00, 'min_loan' => 1500000,  'max_loan' => 100000000, 'features' => ['Fixed rate 3 years', 'Cashback offer', 'Free valuation']],
                ['bank_name' => 'DFCC Bank',                'loan_type' => 'interest_only', 'interest_rate' => 10.50, 'min_loan' => 2000000,  'max_loan' => 120000000, 'features' => ['Interest-only period', 'Investor friendly', 'Competitive rates']],
                ['bank_name' => 'Seylan Bank',              'loan_type' => 'variable',      'interest_rate' => 12.25, 'min_loan' => 750000,   'max_loan' => 90000000,  'features' => ['No hidden fees', 'Flexible schedule', '24/7 customer support']],
            ];
            foreach ($banks as $i => $b) {
                DB::table('bank_loan_rates')->insert([
                    'bank_name'     => $b['bank_name'],
                    'loan_type'     => $b['loan_type'],
                    'interest_rate' => $b['interest_rate'],
                    'min_loan'      => $b['min_loan'],
                    'max_loan'      => $b['max_loan'],
                    'max_term'      => 30,
                    'features'      => json_encode($b['features']),
                    'is_active'     => true,
                    'sort_order'    => $i,
                    'created_at'    => $now,
                    'updated_at'    => $now,
                ]);
            }
        }

        // ── 5. Properties ─────────────────────────────────────────────────────
        if (DB::table('properties')->count() > 0) {
            $this->command->info('Properties already exist — skipping.');
            return;
        }

        $agentUser = $agentIds[0] ?? DB::table('users')->where('role', 'agent')->value('id')
                                   ?? DB::table('users')->value('id');

        $propertyImages = [
            'house' => [
                'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
                'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
                'https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=800&q=80',
                'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=800&q=80',
            ],
            'apartment' => [
                'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
                'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
                'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
                'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
            ],
            'villa' => [
                'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
                'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
                'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
            ],
            'commercial' => [
                'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
                'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
                'https://images.unsplash.com/photo-1554435493-93422e8220c8?w=800&q=80',
                'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
            ],
            'land' => [
                'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80',
                'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80',
                'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
            ],
            'new' => [
                'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
                'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80',
                'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
                'https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?w=800&q=80',
            ],
        ];

        $properties = [
            // ── For Sale (domestic) ──────────────────────────────────────────
            ['title' => '4-Bed Family Home in Colombo 5',         'price' => 45000000,  'beds' => 4, 'baths' => 3, 'cars' => 2, 'land_size' => '12 perches',  'type' => 'House',     'listing' => 'buy',  'suburb' => 'Colombo 5',    'state' => 'Western',       'postcode' => '00500', 'category' => 'domestic', 'condition' => 'used',  'images' => 'house',     'desc' => 'Spacious family home in the heart of Colombo 5 with modern finishes, large garden, and secure parking. Walking distance to schools and shopping.'],
            ['title' => 'Modern Apartment in Rajagiriya',          'price' => 28000000,  'beds' => 3, 'baths' => 2, 'cars' => 1, 'land_size' => null,          'type' => 'Apartment', 'listing' => 'buy',  'suburb' => 'Rajagiriya',   'state' => 'Western',       'postcode' => '10107', 'category' => 'domestic', 'condition' => 'used',  'images' => 'apartment', 'desc' => 'Contemporary 3-bedroom apartment with panoramic city views, fully fitted kitchen, and access to rooftop pool and gym facilities.'],
            ['title' => 'Luxury Villa in Mirissa',                 'price' => 120000000, 'beds' => 5, 'baths' => 4, 'cars' => 3, 'land_size' => '40 perches',  'type' => 'Villa',     'listing' => 'buy',  'suburb' => 'Mirissa',      'state' => 'Southern',      'postcode' => '81540', 'category' => 'domestic', 'condition' => 'used',  'images' => 'villa',     'desc' => 'Stunning beachfront villa with infinity pool, lush tropical gardens, and breathtaking ocean views. Ideal for luxury living or boutique hospitality.', 'featured' => true],
            ['title' => 'Hill Country Bungalow in Kandy',          'price' => 35000000,  'beds' => 3, 'baths' => 2, 'cars' => 1, 'land_size' => '20 perches',  'type' => 'House',     'listing' => 'buy',  'suburb' => 'Kandy',        'state' => 'Central',       'postcode' => '20000', 'category' => 'domestic', 'condition' => 'used',  'images' => 'house',     'desc' => 'Charming bungalow nestled in the hills of Kandy with stunning mountain views, large verandah, and mature garden perfect for a peaceful retreat.'],
            ['title' => '2-Bed Apartment in Colombo 3',            'price' => 22000000,  'beds' => 2, 'baths' => 2, 'cars' => 1, 'land_size' => null,          'type' => 'Apartment', 'listing' => 'buy',  'suburb' => 'Colombo 3',    'state' => 'Western',       'postcode' => '00300', 'category' => 'domestic', 'condition' => 'used',  'images' => 'apartment', 'desc' => 'Well-maintained apartment in a prime Colombo 3 location. Features include fitted wardrobes, modern kitchen, and 24-hour security.'],
            ['title' => 'Beachfront Property in Negombo',          'price' => 65000000,  'beds' => 4, 'baths' => 3, 'cars' => 2, 'land_size' => '30 perches',  'type' => 'House',     'listing' => 'buy',  'suburb' => 'Negombo',      'state' => 'Western',       'postcode' => '11500', 'category' => 'domestic', 'condition' => 'used',  'images' => 'villa',     'desc' => 'Rare beachfront opportunity in Negombo. This 4-bedroom property offers direct beach access, ocean views from every room, and a large entertaining deck.', 'featured' => true],
            ['title' => 'Family Townhouse in Nugegoda',            'price' => 32000000,  'beds' => 3, 'baths' => 2, 'cars' => 2, 'land_size' => '8 perches',   'type' => 'Townhouse', 'listing' => 'buy',  'suburb' => 'Nugegoda',     'state' => 'Western',       'postcode' => '10250', 'category' => 'domestic', 'condition' => 'used',  'images' => 'house',     'desc' => 'Modern townhouse in quiet Nugegoda cul-de-sac. Open-plan living, private courtyard, and easy access to High Level Road and Maharagama.'],
            ['title' => 'Land in Galle with Sea Views',            'price' => 18000000,  'beds' => 0, 'baths' => 0, 'cars' => 0, 'land_size' => '50 perches',  'type' => 'Land',      'listing' => 'buy',  'suburb' => 'Galle',        'state' => 'Southern',      'postcode' => '80000', 'category' => 'domestic', 'condition' => 'used',  'images' => 'land',      'desc' => 'Prime 50-perch plot in sought-after Galle location with uninterrupted sea views. Council approved for residential development. Services connected.'],

            // ── For Rent (domestic) ──────────────────────────────────────────
            ['title' => 'Furnished Apartment in Colombo 7',        'price' => 150000,    'beds' => 2, 'baths' => 2, 'cars' => 1, 'land_size' => null,          'type' => 'Apartment', 'listing' => 'rent', 'suburb' => 'Colombo 7',    'state' => 'Western',       'postcode' => '00700', 'category' => 'domestic', 'condition' => 'used',  'images' => 'apartment', 'desc' => 'Fully furnished 2-bedroom apartment in Cinnamon Gardens. High ceilings, polished floors, modern appliances, and secured parking included.'],
            ['title' => 'Spacious House in Battaramulla',           'price' => 120000,    'beds' => 4, 'baths' => 3, 'cars' => 2, 'land_size' => '15 perches',  'type' => 'House',     'listing' => 'rent', 'suburb' => 'Battaramulla', 'state' => 'Western',       'postcode' => '10120', 'category' => 'domestic', 'condition' => 'used',  'images' => 'house',     'desc' => 'Large family home with beautiful garden in Battaramulla. Close to parliament complex, international schools, and Rajagiriya shopping area.'],
            ['title' => 'Studio Apartment in Mount Lavinia',        'price' => 55000,     'beds' => 1, 'baths' => 1, 'cars' => 0, 'land_size' => null,          'type' => 'Apartment', 'listing' => 'rent', 'suburb' => 'Mount Lavinia','state' => 'Western',       'postcode' => '10370', 'category' => 'domestic', 'condition' => 'used',  'images' => 'apartment', 'desc' => 'Cosy studio near the beach in Mount Lavinia. Fully tiled, AC, hot water, and walking distance to beach and restaurants.'],
            ['title' => 'Villa for Rent in Galle Fort Area',        'price' => 200000,    'beds' => 3, 'baths' => 2, 'cars' => 1, 'land_size' => '12 perches',  'type' => 'Villa',     'listing' => 'rent', 'suburb' => 'Galle',        'state' => 'Southern',      'postcode' => '80000', 'category' => 'domestic', 'condition' => 'used',  'images' => 'villa',     'desc' => 'Beautifully restored villa near Galle Fort. Character property with modern amenities, private garden, and off-street parking. Available long-term.'],
            ['title' => '3-Bed House in Kurunegala Town',           'price' => 75000,     'beds' => 3, 'baths' => 2, 'cars' => 1, 'land_size' => '10 perches',  'type' => 'House',     'listing' => 'rent', 'suburb' => 'Kurunegala',   'state' => 'North Western', 'postcode' => '60000', 'category' => 'domestic', 'condition' => 'used',  'images' => 'house',     'desc' => 'Well-maintained 3-bedroom house in central Kurunegala. Ideal for families, with large kitchen, utility area, and enclosed garden.'],

            // ── Sold (domestic) ───────────────────────────────────────────────
            ['title' => 'House Sold in Maharagama',                 'price' => 38000000,  'beds' => 3, 'baths' => 2, 'cars' => 1, 'land_size' => '10 perches',  'type' => 'House',     'listing' => 'sold', 'suburb' => 'Maharagama',   'state' => 'Western',       'postcode' => '10280', 'category' => 'domestic', 'condition' => 'used',  'images' => 'house',     'desc' => 'Recently sold family home in Maharagama. 3 bedrooms, 2 bathrooms and a beautiful garden. Sold above asking price within 2 weeks of listing.', 'sold_date' => '2026-03-15', 'status' => 'sold'],
            ['title' => 'Apartment Sold in Dehiwala',               'price' => 19500000,  'beds' => 2, 'baths' => 1, 'cars' => 1, 'land_size' => null,          'type' => 'Apartment', 'listing' => 'sold', 'suburb' => 'Dehiwala',     'state' => 'Western',       'postcode' => '10350', 'category' => 'domestic', 'condition' => 'used',  'images' => 'apartment', 'desc' => 'Compact 2-bed apartment sold in sought-after Dehiwala location. Strong investor demand drove a competitive bidding process.', 'sold_date' => '2026-04-02', 'status' => 'sold'],
            ['title' => 'Villa Sold in Beruwala',                   'price' => 85000000,  'beds' => 4, 'baths' => 3, 'cars' => 2, 'land_size' => '25 perches',  'type' => 'Villa',     'listing' => 'sold', 'suburb' => 'Beruwala',     'state' => 'Western',       'postcode' => '12070', 'category' => 'domestic', 'condition' => 'used',  'images' => 'villa',     'desc' => 'Stunning coastal villa sold to an international buyer. Features pool, landscaped gardens, and 180-degree ocean views. Record sale for the area.', 'sold_date' => '2026-02-20', 'status' => 'sold'],

            // ── New Homes ────────────────────────────────────────────────────
            ['title' => 'Brand New 3-Bed House in Malabe',          'price' => 42000000,  'beds' => 3, 'baths' => 2, 'cars' => 2, 'land_size' => '6 perches',   'type' => 'House',     'listing' => 'buy',  'suburb' => 'Malabe',       'state' => 'Western',       'postcode' => '10115', 'category' => 'domestic', 'condition' => 'new',   'images' => 'new',       'desc' => 'Brand new 3-bedroom home in a modern Malabe development. Premium finishes throughout, energy-efficient construction, and private outdoor space.', 'featured' => true],
            ['title' => 'New Luxury Apartment — Colombo 2',         'price' => 55000000,  'beds' => 3, 'baths' => 2, 'cars' => 1, 'land_size' => null,          'type' => 'Apartment', 'listing' => 'buy',  'suburb' => 'Colombo 2',    'state' => 'Western',       'postcode' => '00200', 'category' => 'domestic', 'condition' => 'new',   'images' => 'new',       'desc' => 'Off-the-plan luxury apartment in a prestigious Colombo 2 tower. Floor-to-ceiling windows, imported fittings, and world-class amenities.'],
            ['title' => 'New Townhouse in Hokandara',               'price' => 31000000,  'beds' => 3, 'baths' => 2, 'cars' => 1, 'land_size' => '5 perches',   'type' => 'Townhouse', 'listing' => 'buy',  'suburb' => 'Hokandara',    'state' => 'Western',       'postcode' => '10118', 'category' => 'domestic', 'condition' => 'new',   'images' => 'new',       'desc' => 'Newly built townhouse in a gated Hokandara community. Modern open-plan design with smart home features, intercom, and CCTV security.'],
            ['title' => 'New 4-Bed Villa in Thalawathugoda',        'price' => 78000000,  'beds' => 4, 'baths' => 3, 'cars' => 2, 'land_size' => '14 perches',  'type' => 'Villa',     'listing' => 'buy',  'suburb' => 'Thalawathugoda','state' => 'Western',      'postcode' => '10116', 'category' => 'domestic', 'condition' => 'new',   'images' => 'new',       'desc' => 'Architecturally designed new villa with premium German kitchen, Italian tiles, and landscaped garden in a quiet Thalawathugoda road.'],
            ['title' => 'New Apartment Off-Plan — Rajagiriya',      'price' => 24000000,  'beds' => 2, 'baths' => 1, 'cars' => 1, 'land_size' => null,          'type' => 'Apartment', 'listing' => 'buy',  'suburb' => 'Rajagiriya',   'state' => 'Western',       'postcode' => '10107', 'category' => 'domestic', 'condition' => 'new',   'images' => 'new',       'desc' => 'Secure off-plan 2-bedroom apartment in a boutique Rajagiriya development. Early buyer discounts available. Completion Q4 2026.'],

            // ── Commercial ───────────────────────────────────────────────────
            ['title' => 'Prime Office Space in Fort, Colombo',      'price' => 95000000,  'beds' => 0, 'baths' => 2, 'cars' => 5, 'land_size' => '4500 sqft',  'type' => 'Apartment', 'listing' => 'buy',  'suburb' => 'Colombo 1',    'state' => 'Western',       'postcode' => '00100', 'category' => 'commercial','condition' => 'used', 'images' => 'commercial','desc' => 'Grade-A office space in Colombo Fort CBD. 4,500 sqft column-free floor plate, high-speed lifts, backup power, and excellent transport links.', 'featured' => true],
            ['title' => 'Retail Shop in Pettah Market',             'price' => 22000000,  'beds' => 0, 'baths' => 1, 'cars' => 0, 'land_size' => '800 sqft',   'type' => 'Apartment', 'listing' => 'buy',  'suburb' => 'Pettah',       'state' => 'Western',       'postcode' => '00100', 'category' => 'commercial','condition' => 'used', 'images' => 'commercial','desc' => 'High-footfall retail unit in the heart of Pettah. Ideal for fashion, electronics, or food retail. Immediate access to bus and rail.'],
            ['title' => 'Warehouse in Kelaniya Industrial Zone',    'price' => 55000000,  'beds' => 0, 'baths' => 2, 'cars' => 10,'land_size' => '10000 sqft', 'type' => 'Land',      'listing' => 'buy',  'suburb' => 'Kelaniya',     'state' => 'Western',       'postcode' => '11600', 'category' => 'commercial','condition' => 'used', 'images' => 'commercial','desc' => 'Freestanding warehouse in Kelaniya industrial estate. 10,000 sqft with 8m clearance height, 3-phase power, and dedicated truck access.'],
            ['title' => 'Restaurant Space for Rent — Galle Road',   'price' => 180000,    'beds' => 0, 'baths' => 2, 'cars' => 3, 'land_size' => '2200 sqft',  'type' => 'Apartment', 'listing' => 'rent', 'suburb' => 'Colombo 3',    'state' => 'Western',       'postcode' => '00300', 'category' => 'commercial','condition' => 'used', 'images' => 'commercial','desc' => 'Prime Galle Road restaurant or café space. Open-plan layout with existing kitchen fit-out, grease trap, and alfresco dining area. High visibility location.'],
            ['title' => 'Office Floor in World Trade Centre',       'price' => 350000,    'beds' => 0, 'baths' => 4, 'cars' => 8, 'land_size' => '6000 sqft',  'type' => 'Apartment', 'listing' => 'rent', 'suburb' => 'Colombo 1',    'state' => 'Western',       'postcode' => '00100', 'category' => 'commercial','condition' => 'used', 'images' => 'commercial','desc' => 'Full floor available in the iconic World Trade Centre. Prestige address with panoramic harbour views, 24-hour security, and full facilities management.'],
            ['title' => 'Commercial Land in Kadawatha',             'price' => 40000000,  'beds' => 0, 'baths' => 0, 'cars' => 0, 'land_size' => '1 acre',     'type' => 'Land',      'listing' => 'buy',  'suburb' => 'Kadawatha',    'state' => 'Western',       'postcode' => '11850', 'category' => 'commercial','condition' => 'used', 'images' => 'land',      'desc' => 'Flat 1-acre commercial plot on the Kandy Road corridor. Zoned for light industrial or logistics use. High visibility frontage with easy highway access.'],
        ];

        foreach ($properties as $i => $p) {
            $agentIdx = $i % count($agentIds);
            $agentName = $agents[$agentIdx]['name'] ?? 'Greenbrick Agent';

            $propertyId = DB::table('properties')->insertGetId([
                'user_id'       => $agentIds[$agentIdx],
                'title'         => $p['title'],
                'price'         => $p['price'],
                'price_per_week'=> $p['listing'] === 'rent' ? (int)($p['price'] * 12) : null,
                'address'       => rand(1, 200) . ' ' . $p['suburb'] . ' Road',
                'suburb'        => $p['suburb'],
                'state'         => $p['state'],
                'postcode'      => $p['postcode'],
                'country'       => 'Sri Lanka',
                'beds'          => $p['beds'],
                'baths'         => $p['baths'],
                'cars'          => $p['cars'],
                'land_size'     => $p['land_size'],
                'property_type' => $p['type'],
                'condition'     => $p['condition'],
                'category'      => $p['category'],
                'listing_type'  => $p['listing'],
                'description'   => $p['desc'],
                'agent_name'    => $agentName,
                'agency_name'   => 'Greenbrick Real Estate',
                'sold_date'     => $p['sold_date'] ?? null,
                'days_listed'   => rand(1, 90),
                'is_featured'   => $p['featured'] ?? false,
                'status'        => $p['status'] ?? 'active',
                'listing_fee'   => 0,
                'created_at'    => $now,
                'updated_at'    => $now,
            ]);

            // Insert 3 images per property
            $imgs = $propertyImages[$p['images']];
            foreach (array_slice($imgs, 0, 3) as $si => $imgUrl) {
                DB::table('property_images')->insert([
                    'property_id' => $propertyId,
                    'image_path'  => $imgUrl,
                    'is_primary'  => $si === 0,
                    'sort_order'  => $si,
                    'created_at'  => $now,
                    'updated_at'  => $now,
                ]);
            }
        }
    }
}
