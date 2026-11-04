import React, { useState } from 'react';
import {
  ShoppingBag, Plus, Trash2, Edit3, Image as ImageIcon,
  DollarSign, CheckCircle2, ShieldCheck, CreditCard, Send,
  ChevronRight, X, Upload, Layers, AlertCircle, Phone, Mail,
  MapPin, Check, Eye, HelpCircle
} from 'lucide-react';

export const ShopView = ({
  currentUser,
  isAdmin,
  t
}) => {
  // Showcase categories / showcase areas
  const [categories, setCategories] = useState(['全部', '文创周边', '数字艺术', '技术专刊', '典藏手作']);
  const [activeCategory, setActiveCategory] = useState('全部');
  const [toast, setToast] = useState('');

  // Products state with multi-image support
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('wf_shop_products');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'prod-1',
        name: '白狐·青丘踏雪 纯手工真丝书签礼盒',
        category: '文创周边',
        price: 99.00,
        currency: 'CNY',
        stock: 35,
        desc: '苏绣大师手工监制，纯真丝绣线配以和田青玉坠子，温润雅致，读书抚卷之良伴。',
        images: [
          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80'
        ],
        sales: 128
      },
      {
        id: 'prod-2',
        name: '《多云边缘计算架构设计与实践》特装纪念册',
        category: '技术专刊',
        price: 168.00,
        currency: 'CNY',
        stock: 18,
        desc: '全书收录白狐博客核心架构源码解读与多云边缘配置实战指南，特种纸烫金印制。',
        images: [
          'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80'
        ],
        sales: 86
      },
      {
        id: 'prod-3',
        name: '白狐光影视觉集 · 数字艺术原画集 (4K无损版权)',
        category: '数字艺术',
        price: 299.00,
        currency: 'CNY',
        stock: 999,
        desc: '包含全套青丘仙境与现代赛博交织的原创4K全壁纸与源工程分层文件，附数字授权证书。',
        images: [
          'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80'
        ],
        sales: 312
      }
    ];
  });

  // Orders list (Admin only)
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('wf_shop_orders');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'ord-1001',
        productName: '白狐·青丘踏雪 纯手工真丝书签礼盒',
        quantity: 2,
        totalAmount: 198.00,
        customerName: '墨客先生',
        customerPhone: '13800138000',
        customerEmail: 'moke@example.com',
        shippingAddress: '浙江省杭州市西湖区灵隐路88号',
        paymentMethod: 'wechat',
        status: '已付款待发货',
        createdAt: '2025-05-18 10:30'
      }
    ];
  });

  // Payment Gateways configuration (Admin only reserved interfaces)
  const [paymentConfig, setPaymentConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('wf_payment_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      paypal: { enabled: true, clientId: 'sb-client-id-sample', mode: 'sandbox' },
      worldfirst: { enabled: true, merchantId: 'WF_MERCHANT_888999', apiKey: '' },
      wechat: { enabled: true, mchId: '1600000000', apiV3Key: '' },
      alipay: { enabled: true, appId: '2021000000000000', privateKey: '' }
    };
  });

  // Order modal state
  const [orderingProduct, setOrderingProduct] = useState(null);
  const [orderForm, setOrderForm] = useState({
    quantity: 1,
    customerName: currentUser?.username || '',
    customerPhone: '',
    customerEmail: currentUser?.email || '',
    shippingAddress: '',
    paymentMethod: 'wechat'
  });

  // Product edit/create modal state
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: '文创周边',
    price: 99.0,
    currency: 'CNY',
    stock: 50,
    desc: '',
    images: []
  });
  const [newImageUrl, setNewImageUrl] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Upload multiple images to product form
  const handleProductImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1000;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

          setProductForm((prev) => ({
            ...prev,
            images: [...prev.images, dataUrl]
          }));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
    showToast(`已成功载入 ${files.length} 张展示图片！`);
  };

  // Remove one image from product form
  const handleRemoveProductImage = (idx) => {
    setProductForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx)
    }));
  };

  // Save product
  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      showToast('请填写商品名称！');
      return;
    }
    if (!productForm.images.length) {
      showToast('请至少上传或添加一张商品图片！');
      return;
    }

    if (currentEditId) {
      const updated = products.map((p) => p.id === currentEditId ? {
        ...p,
        ...productForm,
        price: parseFloat(productForm.price) || 0,
        stock: parseInt(productForm.stock) || 0
      } : p);
      setProducts(updated);
      localStorage.setItem('wf_shop_products', JSON.stringify(updated));
      showToast(`商品「${productForm.name}」已更新！`);
    } else {
      const newProd = {
        id: 'prod-' + Date.now(),
        ...productForm,
        price: parseFloat(productForm.price) || 0,
        stock: parseInt(productForm.stock) || 0,
        sales: 0
      };
      const updated = [newProd, ...products];
      setProducts(updated);
      localStorage.setItem('wf_shop_products', JSON.stringify(updated));
      showToast(`新商品「${newProd.name}」已成功上架！`);
    }

    setIsEditingProduct(false);
    setCurrentEditId(null);
  };

  // Delete product
  const handleDeleteProduct = (id, name) => {
    if (confirm(`确认彻底下架并删除商品「${name}」？`)) {
      const updated = products.filter((p) => p.id !== id);
      setProducts(updated);
      localStorage.setItem('wf_shop_products', JSON.stringify(updated));
      showToast(`商品已删除`);
    }
  };

  // Submit Customer Order
  const handleSubmitOrder = (e) => {
    e.preventDefault();
    if (!orderForm.customerPhone.trim() || !orderForm.customerEmail.trim() || !orderForm.shippingAddress.trim()) {
      showToast('请务必完整填写联系电话、邮箱与收货地址！');
      return;
    }
    const qty = parseInt(orderForm.quantity) || 1;
    if (qty <= 0) return;

    const total = (orderingProduct.price * qty).toFixed(2);
    const newOrder = {
      id: 'ord-' + Date.now().toString().slice(-6),
      productName: orderingProduct.name,
      quantity: qty,
      totalAmount: parseFloat(total),
      customerName: orderForm.customerName.trim() || '访客',
      customerPhone: orderForm.customerPhone.trim(),
      customerEmail: orderForm.customerEmail.trim(),
      shippingAddress: orderForm.shippingAddress.trim(),
      paymentMethod: orderForm.paymentMethod,
      status: '待支付已记录',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem('wf_shop_orders', JSON.stringify(updatedOrders));

    // Deduct stock
    const updatedProducts = products.map((p) => p.id === orderingProduct.id ? {
      ...p,
      stock: Math.max(0, p.stock - qty),
      sales: (p.sales || 0) + qty
    } : p);
    setProducts(updatedProducts);
    localStorage.setItem('wf_shop_products', JSON.stringify(updatedProducts));

    setOrderingProduct(null);
    showToast(`订单已成功提交！订单号：${newOrder.id}，稍后将通过邮件与电话与您联系。`);
  };

  const filteredProducts = products.filter(
    (p) => activeCategory === '全部' || p.category === activeCategory
  );

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-xl flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>白狐甄选 · 文创衍生品与数字艺术商城</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              甄选文创与数字商品区
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              支持多图轮播展示、多选区分类管理、价格与库存调控，预留 PayPal、万里汇、微信支付、支付宝主流结算通道。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => {
                  setCurrentEditId(null);
                  setProductForm({
                    name: '',
                    category: activeCategory === '全部' ? '文创周边' : activeCategory,
                    price: 99.0,
                    currency: 'CNY',
                    stock: 50,
                    desc: '',
                    images: []
                  });
                  setIsEditingProduct(true);
                }}
                className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>新增商品展示区</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Categories Bar */}
      <div className="bg-white/70 backdrop-blur-md p-3 rounded-2xl border border-slate-200/80 flex items-center gap-2 overflow-x-auto">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === c
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Products Showcase Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className="group bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between"
          >
            <div>
              {/* Image Showcase with Multi-image counter */}
              <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                <img
                  src={p.images[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-semibold">
                  {p.category}
                </div>
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                  {p.images.length} 张展示图
                </div>

                {/* Admin Quick Action Floating Buttons */}
                {isAdmin && (
                  <div className="absolute bottom-3 right-3 flex items-center space-x-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setCurrentEditId(p.id);
                        setProductForm({ ...p });
                        setIsEditingProduct(true);
                      }}
                      className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-700 shadow-sm cursor-pointer"
                      title="编辑商品"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id, p.name)}
                      className="p-1.5 rounded-lg bg-rose-500/90 hover:bg-rose-600 text-white shadow-sm cursor-pointer"
                      title="删除商品"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-extrabold text-emerald-700 font-mono">
                    ¥{p.price.toFixed(2)}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    库存: {p.stock} 件 · 已售 {p.sales || 0}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-800 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                  {p.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {p.desc}
                </p>

                {/* Multi-image thumbnail strip */}
                {p.images.length > 1 && (
                  <div className="flex items-center space-x-1.5 pt-1">
                    {p.images.slice(0, 4).map((img, idx) => (
                      <div key={idx} className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                        <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {p.images.length > 4 && (
                      <span className="text-[10px] text-slate-400 font-mono">+{p.images.length - 4}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 pt-0">
              <button
                onClick={() => {
                  setOrderingProduct(p);
                  setOrderForm({
                    quantity: 1,
                    customerName: currentUser?.username || '',
                    customerPhone: '',
                    customerEmail: currentUser?.email || '',
                    shippingAddress: '',
                    paymentMethod: 'wechat'
                  });
                }}
                disabled={p.stock <= 0}
                className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer transition-all"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{p.stock > 0 ? '立即下单选购' : '已售罄'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ADMIN-ONLY SECTION: 支付方式接口配置 & 订单管理列表 */}
      {isAdmin && (
        <div className="space-y-6 pt-6 border-t border-slate-200">
          <div className="bg-amber-50/70 rounded-3xl p-6 border border-amber-200 space-y-4">
            <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-amber-700" />
              <span>商城管理中枢 · 预留收费通道与订单数据 (仅管理员可见)</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>管理员说明：</strong>本选区以及下方的 PayPal、万里汇 (WorldFirst)、微信支付和支付宝接入配置仅对系统站长开放展示，普通注册会员和访客无法查看接口密钥与客户订单信息。
            </p>

            {/* Reserved Payment Gateway Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-1">
              <div className="p-3.5 bg-white rounded-2xl border border-amber-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>PayPal 国际跨境支付</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">已预留</span>
                </div>
                <input
                  type="text"
                  placeholder="PayPal Client ID"
                  value={paymentConfig.paypal.clientId}
                  onChange={(e) => setPaymentConfig({ ...paymentConfig, paypal: { ...paymentConfig.paypal, clientId: e.target.value } })}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 font-mono text-[11px]"
                />
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-amber-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>万里汇 (WorldFirst)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">已预留</span>
                </div>
                <input
                  type="text"
                  placeholder="Merchant ID"
                  value={paymentConfig.worldfirst.merchantId}
                  onChange={(e) => setPaymentConfig({ ...paymentConfig, worldfirst: { ...paymentConfig.worldfirst, merchantId: e.target.value } })}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 font-mono text-[11px]"
                />
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-amber-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>微信支付 (WeChat Pay)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">已预留</span>
                </div>
                <input
                  type="text"
                  placeholder="微信商户号 MchID"
                  value={paymentConfig.wechat.mchId}
                  onChange={(e) => setPaymentConfig({ ...paymentConfig, wechat: { ...paymentConfig.wechat, mchId: e.target.value } })}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 font-mono text-[11px]"
                />
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-amber-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>支付宝 (Alipay)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">已预留</span>
                </div>
                <input
                  type="text"
                  placeholder="支付宝 AppID"
                  value={paymentConfig.alipay.appId}
                  onChange={(e) => setPaymentConfig({ ...paymentConfig, alipay: { ...paymentConfig.alipay, appId: e.target.value } })}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem('wf_payment_config', JSON.stringify(paymentConfig));
                  showToast('支付网关接口参数已安全保存！');
                }}
                className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                保存收费通道设置
              </button>
            </div>
          </div>

          {/* Customer Orders Table (Admin Only) */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2 font-bold text-sm text-slate-800">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>全站客户提交订单列表 ({orders.length}) · 站长专享</span>
              </div>
              <span className="text-[11px] text-slate-400">包含送货地址、联系电话与邮箱</span>
            </div>

            <div className="overflow-x-auto">
              {orders.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">暂无客户订单</p>
              ) : (
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">订单号 / 时间</th>
                      <th className="py-2.5 px-3">订购商品与数量</th>
                      <th className="py-2.5 px-3">总金额</th>
                      <th className="py-2.5 px-3">联系人与电话</th>
                      <th className="py-2.5 px-3">收货地址</th>
                      <th className="py-2.5 px-3">支付方式</th>
                      <th className="py-2.5 px-3 text-right">状态 / 管理</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3">
                          <div className="font-mono font-bold text-slate-800">{ord.id}</div>
                          <div className="text-[10px] text-slate-400">{ord.createdAt}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800">{ord.productName}</div>
                          <div className="text-[10px] text-slate-400">数量: {ord.quantity} 件</div>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                          ¥{ord.totalAmount?.toFixed(2)}
                        </td>
                        <td className="py-3 px-3">
                          <div>{ord.customerName} ({ord.customerPhone})</div>
                          <div className="text-[10px] text-slate-400 font-mono">{ord.customerEmail}</div>
                        </td>
                        <td className="py-3 px-3 max-w-[220px] truncate" title={ord.shippingAddress}>
                          {ord.shippingAddress}
                        </td>
                        <td className="py-3 px-3 uppercase font-mono text-[10px]">
                          {ord.paymentMethod}
                        </td>
                        <td className="py-3 px-3 text-right space-x-2">
                          <button
                            onClick={() => {
                              const updated = orders.filter((o) => o.id !== ord.id);
                              setOrders(updated);
                              localStorage.setItem('wf_shop_orders', JSON.stringify(updated));
                              showToast('订单已删除');
                            }}
                            className="text-rose-500 hover:text-rose-700 cursor-pointer"
                          >
                            删除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Customer Ordering Modal (包含数量选择、电话、邮箱与地址必填) */}
      {orderingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-800">确认订单与结算</h3>
              </div>
              <button
                onClick={() => setOrderingProduct(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl flex items-center space-x-3">
              <img
                src={orderingProduct.images[0] || ''}
                alt="Product"
                className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs text-slate-800 truncate">{orderingProduct.name}</h4>
                <div className="text-xs font-mono font-bold text-emerald-700 mt-0.5">
                  ¥{orderingProduct.price.toFixed(2)}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">选购数量 (Quantity)</label>
                  <input
                    type="number"
                    min={1}
                    max={orderingProduct.stock || 99}
                    required
                    value={orderForm.quantity}
                    onChange={(e) => setOrderForm({ ...orderForm, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">订购人姓名</label>
                  <input
                    type="text"
                    required
                    placeholder="您的称呼"
                    value={orderForm.customerName}
                    onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1 flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>联系电话 (必填 *)</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="例如: 13800138000"
                  value={orderForm.customerPhone}
                  onChange={(e) => setOrderForm({ ...orderForm, customerPhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1 flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-emerald-600" />
                  <span>电子邮箱 (必填 *)</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="用于接收订单通知与物流单号"
                  value={orderForm.customerEmail}
                  onChange={(e) => setOrderForm({ ...orderForm, customerEmail: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>收货详细地址 (必填 *)</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="省 / 市 / 区 / 详细街道与门牌号"
                  value={orderForm.shippingAddress}
                  onChange={(e) => setOrderForm({ ...orderForm, shippingAddress: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">选择支付方式</label>
                <select
                  value={orderForm.paymentMethod}
                  onChange={(e) => setOrderForm({ ...orderForm, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold"
                >
                  <option value="wechat">微信支付 (WeChat Pay)</option>
                  <option value="alipay">支付宝 (Alipay)</option>
                  <option value="paypal">PayPal 国际支付</option>
                  <option value="worldfirst">万里汇 (WorldFirst)</option>
                </select>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-slate-400">应付总额:</span>
                  <span className="text-base font-extrabold text-emerald-700 ml-1.5 font-mono">
                    ¥{((orderingProduct.price || 0) * (orderForm.quantity || 1)).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setOrderingProduct(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow-xs"
                  >
                    提交订单
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Edit / Add Modal (Admin Only) */}
      {isEditingProduct && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-800">
                {currentEditId ? '编辑商品展示区信息' : '新增商品展示区'}
              </h3>
              <button
                onClick={() => setIsEditingProduct(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">商品名称 *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="如：白狐·青丘踏雪 纯手工真丝书签礼盒"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">所属选区 / 分类</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="文创周边">文创周边</option>
                    <option value="数字艺术">数字艺术</option>
                    <option value="技术专刊">技术专刊</option>
                    <option value="典藏手作">典藏手作</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">商品售价 (CNY)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">库存数量</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">详细商品说明</label>
                <textarea
                  rows={3}
                  required
                  value={productForm.desc}
                  onChange={(e) => setProductForm({ ...productForm, desc: e.target.value })}
                  placeholder="商品材质、工艺、技术参数或数字版权说明..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              {/* Multi-image showcase management */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 flex items-center space-x-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <span>商品展示图管理 (支持上传和删除多张图片)</span>
                  </span>
                  <label className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer flex items-center space-x-1 shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>上传本地图片</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleProductImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Image thumbnails list */}
                {productForm.images.length === 0 ? (
                  <p className="text-slate-400 text-center py-4 text-[11px]">暂无展示图片，请上传本地图片或添加直链</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {productForm.images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                        <img src={img} alt="Product img" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveProductImage(idx)}
                          className="absolute top-1 right-1 p-1 rounded-md bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
                          title="删除此图片"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProduct(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow-xs"
                >
                  保存商品展示区
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ShopView;
