import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';
import SEO from '../components/SEO';
import { absoluteUrl } from '../config/site';
import { LocalizedLink as Link } from '../hooks/useLocalizedNavigation';
import { ProductCardSkeleton } from '../components/ProductSection';
import FilterChip from '../components/FilterChip';
import useDebouncedValue from '../hooks/useDebouncedValue';
import { getProductBadge } from '../utils/productBadges';

// Top-level categories get their own crawlable URL (/collection/men). Before
// this, the entire catalogue lived at a single /collection URL behind
// client-side checkboxes, so there was nothing for Google to list as a sitelink
// and no page that could rank for a category term.
//
// `value` matches the backend's product.category field (English, from the
// database) and must never be translated. Everything else is a translation
// key resolved from collection.json at render time.
const CATEGORY_VALUES = { men: 'Men', women: 'Women', kids: 'Kids' }
const SKELETON_COUNT = 8

const Collection = () => {

  const { t } = useTranslation('collection');
  const { categorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const slug = categorySlug?.toLowerCase();
  const activeCategory = slug && CATEGORY_VALUES[slug]
    ? {
        value: CATEGORY_VALUES[slug],
        heading: t(`categories.${slug}.heading`),
        titleWord: t(`categories.${slug}.titleWord`),
        title: t(`categories.${slug}.title`),
        description: t(`categories.${slug}.description`),
      }
    : null;

  const { products , productsLoaded , search , setSearch, showSearch, setShowSearch } = useContext(ShopContext);
  const [showFilter,setShowFilter] = useState(false);
  const [category,setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState(() => {
    const param = searchParams.get('subcategory');
    return param ? param.split(',').filter(Boolean) : [];
  });
  const [sortType, setSortType] = useState(() => searchParams.get('sort') || 'relavent');

  const debouncedSearch = useDebouncedValue(search, 300);

  // The WebSite SearchAction advertises /collection?search={term} to Google.
  // That target used to be a dead end: search lived only in React context, so
  // arriving with ?search= showed the unfiltered catalogue. This only needs
  // to run for a fresh arrival — our own state is the source of truth after
  // that, and writes back into the URL below rather than the other way round.
  useEffect(() => {
    const term = searchParams.get('search');
    if (term) {
      setSearch(term);
      setShowSearch(true);
    }
  }, [searchParams, setSearch, setShowSearch])

  // A category URL pins its own filter; the checkbox group is for the
  // unscoped /collection page.
  useEffect(() => {
    setCategory(activeCategory ? [activeCategory.value] : []);
  }, [categorySlug])

  // Keeps subcategory/sort/search filters in the URL so they survive a
  // refresh or get shared as a link — previously only the category slug was.
  useEffect(() => {
    const params = {};
    if (subCategory.length > 0) params.subcategory = subCategory.join(',');
    if (sortType !== 'relavent') params.sort = sortType;
    if (showSearch && search) params.search = search;
    setSearchParams(params, { replace: true });
  }, [subCategory, sortType, search, showSearch, setSearchParams])

  const toggleCategory = (e) => {

    if (category.includes(e.target.value)) {
        setCategory(prev=> prev.filter(item => item !== e.target.value))
    }
    else{
      setCategory(prev => [...prev,e.target.value])
    }

  }

  const toggleSubCategory = (e) => {

    if (subCategory.includes(e.target.value)) {
      setSubCategory(prev=> prev.filter(item => item !== e.target.value))
    }
    else{
      setSubCategory(prev => [...prev,e.target.value])
    }
  }

  // A single derived value rather than two independent effects — the
  // previous version filtered in one effect (keyed on category/subCategory/
  // search) and sorted in another (keyed only on sortType), so toggling a
  // filter while a sort was active silently reverted the list to unsorted
  // order even though the sort dropdown still showed it as active. Deriving
  // both together guarantees sort is always reapplied against the current
  // filter set.
  const filterProducts = useMemo(() => {
    let result = products.slice();

    if (showSearch && debouncedSearch) {
      const term = debouncedSearch.toLowerCase();
      result = result.filter(item =>
        item.name.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term) ||
        item.subCategory.toLowerCase().includes(term)
      );
    }

    if (category.length > 0) {
      result = result.filter(item => category.includes(item.category));
    }

    if (subCategory.length > 0) {
      result = result.filter(item => subCategory.includes(item.subCategory));
    }

    switch (sortType) {
      case 'low-high':
        result = [...result].sort((a,b)=>(a.price - b.price));
        break;
      case 'high-low':
        result = [...result].sort((a,b)=>(b.price - a.price));
        break;
      default:
        break;
    }

    return result;
  }, [products, category, subCategory, debouncedSearch, showSearch, sortType])

  const activeFilterChips = [
    ...(!activeCategory ? category.map(value => ({
      key: `category-${value}`,
      label: t(`filters.${value.toLowerCase()}`),
      onRemove: () => setCategory(prev => prev.filter(item => item !== value)),
    })) : []),
    ...subCategory.map(value => ({
      key: `subcategory-${value}`,
      label: t(`filters.${value.toLowerCase()}`),
      onRemove: () => setSubCategory(prev => prev.filter(item => item !== value)),
    })),
    ...(showSearch && search ? [{
      key: 'search',
      label: `"${search}"`,
      onRemove: () => { setSearch(''); setShowSearch(false) },
    }] : []),
  ];

  const clearAllFilters = () => {
    if (!activeCategory) setCategory([]);
    setSubCategory([]);
    setSearch('');
    setShowSearch(false);
  };

  const path = activeCategory ? `/collection/${slug}` : '/collection';
  const heading = activeCategory ? activeCategory.heading : `${t('headings.all')} ${t('headings.collections')}`;

  // A category with nothing in it is a soft 404 — Google indexes the URL, finds
  // no content, and the thin page drags on the rest of the site. /collection/kids
  // is empty today. Measured against the whole catalogue, not the filtered view,
  // so an active search box never flips a real category to noindex.
  const categoryIsEmpty =
    activeCategory && productsLoaded &&
    !products.some((item) => item.category === activeCategory.value);

  const breadcrumb = activeCategory
    ? [{ name: 'Home', path: '/' }, { name: 'Collection', path: '/collection' }, { name: activeCategory.heading }]
    : [{ name: 'Home', path: '/' }, { name: 'Collection' }];

  // ItemList gives Google an explicit, ordered manifest of what is on this page
  // and a direct crawl path to every product URL.
  const itemListNode = filterProducts.length
    ? [{
        '@type': 'ItemList',
        '@id': `${absoluteUrl(path)}#itemlist`,
        name: heading,
        numberOfItems: filterProducts.length,
        itemListElement: filterProducts.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: absoluteUrl(`/product/${item._id}`),
          name: item.name,
        })),
      }]
    : [];

  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>
      <SEO
        title={activeCategory ? activeCategory.title : t('allProducts.title')}
        description={activeCategory ? activeCategory.description : t('allProducts.description')}
        path={path}
        noindex={categoryIsEmpty}
        breadcrumb={breadcrumb}
        extraSchemaNodes={itemListNode}
      />

      {/* Filter Options */}
      <div className='min-w-60'>
        <button
          type='button'
          onClick={()=>setShowFilter(!showFilter)}
          aria-expanded={showFilter}
          className='my-2 text-xl flex items-center cursor-pointer gap-2 bg-transparent border-0 p-0'
        >
          {t('filters.label')}
          <img className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`} src={assets.dropdown_icon} alt="" />
        </button>
        {/* Category Filter — hidden on a category URL, which already pins it */}
        {!activeCategory && (
        <fieldset className={`border border-line pl-5 py-3 mt-6 ${showFilter ? '' :'hidden'} sm:block`}>
          <legend className='mb-3 text-sm font-medium px-0'>{t('filters.categoriesLabel')}</legend>
          <div className='flex flex-col gap-2 text-sm font-light text-stone'>
            <label className='flex gap-2 items-center'>
              <input className='w-3' type="checkbox" value={'Men'} checked={category.includes('Men')} onChange={toggleCategory}/> {t('filters.men')}
            </label>
            <label className='flex gap-2 items-center'>
              <input className='w-3' type="checkbox" value={'Women'} checked={category.includes('Women')} onChange={toggleCategory}/> {t('filters.women')}
            </label>
            <label className='flex gap-2 items-center'>
              <input className='w-3' type="checkbox" value={'Kids'} checked={category.includes('Kids')} onChange={toggleCategory}/> {t('filters.kids')}
            </label>
          </div>
        </fieldset>
        )}
        {/* SubCategory Filter */}
        <fieldset className={`border border-line pl-5 py-3 my-5 ${showFilter ? '' :'hidden'} sm:block`}>
          <legend className='mb-3 text-sm font-medium px-0'>{t('filters.typeLabel')}</legend>
          <div className='flex flex-col gap-2 text-sm font-light text-stone'>
            <label className='flex gap-2 items-center'>
              <input className='w-3' type="checkbox" value={'Topwear'} checked={subCategory.includes('Topwear')} onChange={toggleSubCategory}/> {t('filters.topwear')}
            </label>
            <label className='flex gap-2 items-center'>
              <input className='w-3' type="checkbox" value={'Bottomwear'} checked={subCategory.includes('Bottomwear')} onChange={toggleSubCategory}/> {t('filters.bottomwear')}
            </label>
            <label className='flex gap-2 items-center'>
              <input className='w-3' type="checkbox" value={'Winterwear'} checked={subCategory.includes('Winterwear')} onChange={toggleSubCategory}/> {t('filters.winterwear')}
            </label>
          </div>
        </fieldset>
      </div>

      {/* Right Side */}
      <div className='flex-1'>

        <div className='flex justify-between text-base sm:text-2xl mb-4'>
            <Title text1={activeCategory ? activeCategory.titleWord : t('headings.all')} text2={activeCategory ? t('headings.collection') : t('headings.collections')} as='h1' />
            {/* Porduct Sort */}
            <select value={sortType} onChange={(e)=>setSortType(e.target.value)} className='border-2 border-line text-sm px-2' aria-label='Sort products'>
              <option value="relavent">{t('sort.relevant')}</option>
              <option value="low-high">{t('sort.lowHigh')}</option>
              <option value="high-low">{t('sort.highLow')}</option>
            </select>
        </div>

        {(activeFilterChips.length > 0 || productsLoaded) && (
          <div className='flex flex-wrap items-center gap-2 mb-4'>
            {productsLoaded && (
              <span className='text-xs text-stone mr-1'>{t('results.count', { count: filterProducts.length })}</span>
            )}
            {activeFilterChips.map(chip => (
              <FilterChip key={chip.key} label={chip.label} onRemove={chip.onRemove} />
            ))}
            {activeFilterChips.length > 0 && (
              <button type='button' onClick={clearAllFilters} className='text-xs underline text-stone hover:text-ink cursor-pointer bg-transparent border-0 p-0'>
                {t('filters.clearAll')}
              </button>
            )}
          </div>
        )}

        {/* Map Products */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
          {
            !productsLoaded
              ? Array.from({ length: SKELETON_COUNT }).map((_, index) => <ProductCardSkeleton key={index} />)
              : filterProducts.map((item)=>(
                  <ProductItem key={item._id} name={item.name} id={item._id} price={item.price} image={item.image} sizes={item.sizes} badge={getProductBadge(item, t)} />
                ))
          }
        </div>

        {productsLoaded && filterProducts.length === 0 && (
          <p className='text-stone py-10'>
            {t('empty.text')} <Link to='/collection' className='underline'>{t('empty.linkText')}</Link>.
          </p>
        )}
      </div>

    </div>
  )
}

export default Collection
