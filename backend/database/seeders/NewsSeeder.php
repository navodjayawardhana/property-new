<?php

namespace Database\Seeders;

use App\Models\NewsArticle;
use Illuminate\Database\Seeder;

class NewsSeeder extends Seeder
{
    public function run(): void
    {
        $articles = [
            [
                'title'        => "The \$300k church offering an unconventional path into the property market",
                'excerpt'      => "A converted church in regional Victoria is giving first-home buyers a unique entry point into the market.",
                'category'     => 'Buying & Building',
                'tag'          => null,
                'image_url'    => 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80',
                'read_time'    => '3 min read',
                'is_published' => true,
                'published_at' => now()->subDays(5),
            ],
            [
                'title'        => "RBA calls for 'rock solid' government support, says housing key for buying",
                'excerpt'      => "The Reserve Bank has called on state and federal governments to accelerate housing supply reforms.",
                'category'     => 'Finance',
                'tag'          => 'INTEREST RATES',
                'image_url'    => 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80',
                'read_time'    => '4 min read',
                'is_published' => true,
                'published_at' => now()->subDays(6),
            ],
            [
                'title'        => "Australia's new horizon offers hope for buying back",
                'excerpt'      => "New data shows first-home buyer activity is recovering in key markets across the eastern seaboard.",
                'category'     => 'News',
                'tag'          => null,
                'image_url'    => 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80',
                'read_time'    => '5 min read',
                'is_published' => true,
                'published_at' => now()->subDays(7),
            ],
            [
                'title'        => "\$20k–\$2k a month: Fisherman's cottage selling tidy income",
                'excerpt'      => "A quirky coastal fisherman's cottage is generating significant rental income for its current owners.",
                'category'     => 'Lifestyle',
                'tag'          => null,
                'image_url'    => 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&q=80',
                'read_time'    => '3 min read',
                'is_published' => true,
                'published_at' => now()->subDays(8),
            ],
            [
                'title'        => "Seven suburbs: When a waterfront home becomes accessible",
                'excerpt'      => "We profile seven suburbs where waterfront living is becoming more accessible than you might think.",
                'category'     => 'Guides',
                'tag'          => null,
                'image_url'    => 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
                'read_time'    => '6 min read',
                'is_published' => true,
                'published_at' => now()->subDays(9),
            ],
            [
                'title'        => "RBA says monetary policy 'can't solve everything'",
                'excerpt'      => "The RBA governor warned that interest rate cuts alone cannot fix Australia's housing affordability crisis.",
                'category'     => 'Finance',
                'tag'          => 'NEWS',
                'image_url'    => 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80',
                'read_time'    => '4 min read',
                'is_published' => true,
                'published_at' => now()->subDays(10),
            ],
            [
                'title'        => "Why more SA buyers are ditching established homes",
                'excerpt'      => "South Australian buyers are increasingly turning to new builds as established home prices soar.",
                'category'     => 'Buying & Building',
                'tag'          => 'NEXT',
                'image_url'    => 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
                'read_time'    => '4 min read',
                'is_published' => true,
                'published_at' => now()->subDays(11),
            ],
            [
                'title'        => "You're single – and it's costing you thousands",
                'excerpt'      => "Single buyers face a 35% premium compared to couples when purchasing a home, new research reveals.",
                'category'     => 'Finance',
                'tag'          => null,
                'image_url'    => 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80',
                'read_time'    => '3 min read',
                'is_published' => true,
                'published_at' => now()->subDays(12),
            ],
            [
                'title'        => "New country home in Aus: how one buyer upsized",
                'excerpt'      => "A sea-change buyer shares how they upsized from a city apartment to a sprawling country estate.",
                'category'     => 'Lifestyle',
                'tag'          => null,
                'image_url'    => 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&q=80',
                'read_time'    => '5 min read',
                'is_published' => true,
                'published_at' => now()->subDays(13),
            ],
        ];

        foreach ($articles as $article) {
            NewsArticle::firstOrCreate(['title' => $article['title']], $article);
        }
    }
}
