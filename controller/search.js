const Product = require('../model/products');
const Fuse = require('fuse.js');

exports.SearchProducts = async (req, res) => {
    try {
        const searchQuery = req.body.q ? req.body.q.trim() : '';
        let products = [];

            // Saare products lao
            const allProducts = await Product.find({}, {
                productname: 1,
                description: 1,
                price: 1,
                imagepath: 1
            }).lean();

            // Fuse setup
            const fuse = new Fuse(allProducts, {
                keys: [
                    { name: 'productname', weight: 0.7 },
                    { name: 'description', weight: 0.3 }
                ],
                includeScore: true,
                threshold: 0.4,
                ignoreLocation: true,
                minMatchCharLength: 2
            });

            // Search
            const results = fuse.search(searchQuery);

            // Sirf matched product objects nikaalo
            products = results.map(result => result.item);

        res.render('search_result', {
            Head: 'Search Products',
            products,
            searchQuery,
        });

    } catch (error) {
        console.log('Search Error:', error);
        res.status(500).send('Internal Server Error');
    }
};
