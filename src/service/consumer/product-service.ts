import Product from '../../model/product';
import { BusinessError } from '../../common/packages/common-errors/common-errors';
import { IProduct, IProductFeatures, IProductWithMeta } from '../../common/type/product';
import dbutils from '../../common/packages/db-utils';
import { OrderProduct } from '../../common/type/order';
import { compareAmountsWithTolerance } from '../../common/util';

export default class ProductService {
	summaryFields: string = ' name sku offer oos unit images category_code subcategory_code prices ';
	detailedFields = this.summaryFields + ' desc sort hsn_code tags aliases relatedProduct features';

	private activeCriteria(criteria: any) {
		return { ...criteria, is_active: true };
	}
	private _sortAndFilterProductFeatures(features: IProductFeatures[] | undefined): IProductFeatures[] {
		if (!features) return [];

		features.sort((a, b) => (a.sort || 0) - (b.sort || 0));

		return features;
	}

	public async get(filters: any, pagination: any, sort: string, detailed: boolean = false): Promise<IProductWithMeta> {
		const { criteria, skip, sortOptions, limit } = dbutils.applyPaginationFilter(filters, pagination, sort);
		const activeCriteria = this.activeCriteria(criteria);
		const productList: IProduct[] = await Product.find(activeCriteria)
			.select(`${detailed ? this.detailedFields : this.summaryFields}`)
			.sort(sortOptions as any)
			.collation({ locale: 'en' })
			.skip(skip)
			.limit(limit);
		const totalCount = await Product.countDocuments(activeCriteria);
		const data: IProductWithMeta = {
			data: productList,
			meta: {
				pagination: {
					page: skip / limit + 1,
					pageSize: limit,
					pageCount: Math.ceil(totalCount / limit),
					total: totalCount,
				},
			},
		};
		return data;
	}

	public async getById(id: string): Promise<IProduct> {
		const product = await Product.findById(id)
			.select(this.detailedFields)
			.populate({
				path: 'relatedproducts',
				select: this.summaryFields,
			})
			.populate({
				path: 'variant_id',
				populate: {
					path: 'products._id',
					model: 'products',
					select: 'prices ',
				},
				select: '-created -updated',
			})
			.lean();
		if (!product || product.is_active === false) {
			throw new BusinessError('Product not found', 'ERR_NOT_FOUND');
		}
		product.features = this._sortAndFilterProductFeatures(product.features);
		return product;
	}

	public async getByIds(ids: string[]): Promise<{ _id: string }[]> {
		return await Product.find({ _id: { $in: ids } })
			.select('_id')
			.lean();
	}

	public search = async (
		filters: any,
		pagination: any,
		sort: string,
		searchText: string,
	): Promise<IProductWithMeta> => {
		const { criteria, skip, sortOptions, limit } = dbutils.applyPaginationFilter(filters, pagination, sort);

		const searchCriteria = {
			$or: [{ name: { $regex: searchText, $options: 'i' } }, { desc: { $regex: searchText, $options: 'i' } }],
		};

		const filterSearch = { ...criteria, ...searchCriteria, is_active: true };

		const productList: IProduct[] = await Product.find(filterSearch)
			.select(this.summaryFields)
			.sort(sortOptions as any)
			.collation({ locale: 'en' })
			.skip(skip)
			.limit(limit)
			.lean();

		const totalCount = await Product.countDocuments(filterSearch);

		const data: IProductWithMeta = {
			data: productList,
			meta: {
				pagination: {
					page: skip / limit + 1,
					pageSize: limit,
					pageCount: Math.ceil(totalCount / limit),
					total: totalCount,
				},
			},
		};
		return data;
	};
	private enrichProductDetails(product: IProduct, orderProduct: OrderProduct) {
		return (orderProduct = {
			...orderProduct,
			unit_mrp: product.prices.mrp,
			product_unit: product.unit,
			img_url: product.images.primary,
		});
	}

	public enrichAndValidateOrderProduct = async (orderProduct: OrderProduct) => {
		const product = await this.getById(orderProduct.product_id.toString());
		if (product.oos === true) {
			throw new BusinessError(
				`Product out of stock of product with product id ${orderProduct.product_id}, Refresh Your Cart`,
				'ERR_PRODUCT_OUT_OF_STOCK',
			);
		}
		if (product.sku !== orderProduct.sku) {
			throw new BusinessError(
				'SKU of product does not match with product id ' + orderProduct.product_id,
				'ERR_PRODUCT_SKU_MIS_MATCH',
			);
		}
		if (!compareAmountsWithTolerance(product.prices.sp!, orderProduct.unit_sp)) {
			throw new BusinessError(
				'Unit price does not matchof product with product id ' + orderProduct.product_id,
				'ERR_PRODUCT_UNIT_PRICE_MIS_MATCH',
			);
		}
		if (
			!compareAmountsWithTolerance(
				orderProduct.tax_amount,
				(orderProduct.quantity * (product.prices.pbt! * product.prices.taxpct)) / 100,
			)
		) {
			throw new BusinessError(
				'Tax amount does not match of product with product id ' + orderProduct.product_id,
				'ERR_PRODUCT_TAX_AMOUNT_MIS_MATCH',
			);
		}
		if (!compareAmountsWithTolerance(orderProduct.subtotal, orderProduct.quantity * orderProduct.unit_sp)) {
			throw new BusinessError(
				'Subtotal of product (unit price * quantity) does not match of product with product id ' +
					orderProduct.product_id,
				'ERR_PRODUCT_SUBTOTAL_MIS_MATCH',
			);
		}

		return this.enrichProductDetails(product, orderProduct);
	};
}
