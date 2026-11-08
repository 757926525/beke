import React, { useState, useRef } from 'react';
import {
  ShoppingBag, Tag, Plus, Trash2, Edit3, Eye, DollarSign,
  CreditCard, ShieldCheck, CheckCircle2, ChevronRight, Upload,
  Image as ImageIcon, Phone, Mail, MapPin, User, Package,
  Layers, Settings, AlertCircle, RefreshCw, MessageCircle, Send, X, Check, Clock
} from 'lucide-react';

export const ShopView = ({
  currentUser,
  isAdmin,
  products = [],
  setProducts,
  orders = [],
  setOrders,
  paymentSettings = {},
  setPaymentSettings,
  t
}) => {
  const [activeTab, setActiveTab] = useState('showcase'); // 'showcase' | 'orders' | 'payment-settings' | 'inquiries'
  const [orderFilter, setOrderFilter] = useState('all'); // 'all' | 'paid' | 'unpaid'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [toastMessage, setToastMessage] = useState('');

  // Online Customer Service Chat Modal
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatProduct, setChatProduct] = useState(null);
  const [chatMessages, setChatMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('wf_shop_chat_messages');
      return saved ? JSON.parse(saved) : [
        { id: 1, sender: 'admin', text: '您好！欢迎光临白狐商城，请问有什么可以帮您的？支持咨询商品细节、支付方式或定制需求哦。', time: '刚刚' }
      ];
    } catch {
      return [{ id: 1, sender: 'admin', text: '您好！欢迎光临白狐商城，请问有什么可以帮您的？', time: '刚刚' }];
    }
  });
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: isAdmin ? 'admin' : (currentUser?.username || '访客'),
      role: isAdmin ? 'admin' : 'customer',
      text: inputMessage.trim(),
      productTitle: chatProduct ? chatProduct.name : undefined,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const nextMessages = [...chatMessages, newMsg];
    setChatMessages(nextMessages);
    localStorage.setItem('wf_shop_chat_messages', JSON.stringify(nextMessages));
    setInputMessage('');

    if (!isAdmin) {
      setTimeout(() => {
        const autoReply = {
          id: Date.now() + 1,
          sender: 'admin',
          role: 'admin',
          text: `收到关于「${chatProduct ? chatProduct.name : '商品'}」的咨询！站长已收到实时通知，会尽快为您解答。`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages(prev => {
          const updated = [...prev, autoReply];
          localStorage.setItem('wf_shop_chat_messages', JSON.stringify(updated));
          return updated;
        });
      }, 1000);
    }
  };

  // Product Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: '周边纪念',
    price: 99,
    originalPrice: 129,
    stock: 50,
    desc: '',
    images: []
  });

  // Order Checkout Modal
  const [purchasingProduct, setPurchasingProduct] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderForm, setOrderForm] = useState({
    customerName: currentUser?.username || '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    paymentMethod: 'wechat' // 'wechat' | 'alipay' | 'paypal' | 'worldfirst'
  });

  const [activeImageIndex, setActiveImageIndex] = useState({});

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Categories
  const categories = ['周边纪念', '数码硬件', '源码插件', '文创好物', 'VIP权益'];

  // Handle Image Upload for Product Form (Multi-image support)
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProductForm((prev) => ({
          ...prev,
          images: [...(prev.images || []), event.target.result]
        }));
      };
      reader.readAsDataURL(file);
    });

    showToast(`已成功添加 ${files.length} 张展示图片！`);
    e.target.value = '';
  };

  const handleRemoveImageFromForm = (idx) => {
    setProductForm((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== idx)
    }));
  };

  // Save or Update Product
  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!productForm.name.trim()) return;

    const fallbackImg = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80';
    const finalImages = productForm.images?.length > 0 ? productForm.images : [fallbackImg];

    if (editingProduct) {
      // Update
      const updated = products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              ...productForm,
              images: finalImages,
              updatedAt: new Date().toISOString()
            }
          : p
      );
      setProducts(updated);
      showToast(`商品「${productForm.name}」已更新！`);
    } else {
      // Create
      const newProd = {
        id: 'prod-' + Date.now(),
        ...productForm,
        images: finalImages,
        createdAt: new Date().toISOString()
      };
      setProducts([newProd, ...products]);
      showToast(`商品「${newProd.name}」已发布上架！`);
    }

    setIsProductModalOpen(false);
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: '周边纪念',
      price: 99,
      originalPrice: 129,
      stock: 50,
      desc: '',
      images: []
    });
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      category: p.category || '周边纪念',
      price: p.price,
      originalPrice: p.originalPrice || p.price,
      stock: p.stock || 50,
      desc: p.desc || '',
      images: p.images || []
    });
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = (id) => {
    const prod = products.find((p) => p.id === id);
    if (!confirm(`确定下架并删除商品「${prod?.name || ''}」？`)) return;
    setProducts(products.filter((p) => p.id !== id));
    showToast('商品已成功下架删除！');
  };

  // Order Placement
  const handleOpenBuyModal = (product) => {
    setPurchasingProduct(product);
    setOrderQuantity(1);
    setOrderForm({
      customerName: currentUser?.username || '',
      phone: '',
      email: '',
      address: '',
      notes: '',
      paymentMethod: 'wechat'
    });
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!orderForm.customerName.trim() || !orderForm.phone.trim() || !orderForm.address.trim() || !orderForm.email.trim()) {
      showToast('请完整填写联系人姓名、收货地址、手机号与邮箱！');
      return;
    }

    const totalAmount = purchasingProduct.price * orderQuantity;
    const newOrder = {
      id: 'ord-' + Date.now(),
      productId: purchasingProduct.id,
      productName: purchasingProduct.name,
      productImage: purchasingProduct.images?.[0] || '',
      quantity: orderQuantity,
      unitPrice: purchasingProduct.price,
      totalAmount,
      customerName: orderForm.customerName.trim(),
      phone: orderForm.phone.trim(),
      email: orderForm.email.trim(),
      address: orderForm.address.trim(),
      notes: orderForm.notes.trim(),
      paymentMethod: orderForm.paymentMethod,
      status: 'pending', // 'pending' | 'paid' | 'shipped' | 'completed'
      createdAt: new Date().toLocaleString()
    };

    setOrders([newOrder, ...(orders || [])]);
    setPurchasingProduct(null);
    showToast(`订单【${newOrder.id}】提交成功！站长将尽快联系您处理发货。`);
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
    setOrders(updated);
    showToast(`订单状态已变更为：${newStatus}`);
  };

  // Payment settings save
  const handleSavePaymentSettings = (e) => {
    e.preventDefault();
    setPaymentSettings({ ...paymentSettings });
    showToast('已成功保存多通道预留支付接口配置（仅站长私密可见）！');
  };

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-semibold shadow-xl flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>官方精选商城 · 实体与数字商品专区</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>商品与文创展示区</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                {products.length} 款在售
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              支持多图展示、数量选择与收货信息完整登记；内置 PayPal、万里汇 (WorldFirst)、微信支付与支付宝预留结算接口配置（仅管理员可见）。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('showcase')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'showcase'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Package className="w-3.5 h-3.5 inline mr-1" />
              <span>商品展台</span>
            </button>

            {isAdmin && (
              <>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'orders'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5 inline mr-1" />
                  <span>订单管理 ({orders?.length || 0})</span>
                </button>

                <button
                  onClick={() => setActiveTab('inquiries')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'inquiries'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5 inline mr-1" />
                  <span>客服咨询 ({chatMessages.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('payment-settings')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'payment-settings'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 inline mr-1" />
                  <span>支付接口配置 (站长)</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Categories Bar & Add Product Action */}
        {activeTab === 'showcase' && (
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                全部展示
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {isAdmin && (
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({
                    name: '',
                    category: '周边纪念',
                    price: 99,
                    originalPrice: 129,
                    stock: 50,
                    desc: '',
                    images: []
                  });
                  setIsProductModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>发布新商品</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* TAB 1: Product Showcase Grid */}
      {activeTab === 'showcase' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const currentImgIdx = activeImageIndex[product.id] || 0;
            const images = product.images && product.images.length > 0
              ? product.images
              : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80'];

            return (
              <div
                key={product.id}
                className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group"
              >
                <div>
                  {/* Multi-Image Carousel / Preview */}
                  <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                    <img
                      src={images[currentImgIdx] || images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Category badge */}
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                      {product.category}
                    </span>

                    {/* Stock badge */}
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-500/90 text-white text-[10px] font-bold">
                      库存: {product.stock || 99}
                    </span>

                    {/* Multi-image thumbnail dots */}
                    {images.length > 1 && (
                      <div className="absolute bottom-2 inset-x-0 flex justify-center space-x-1.5 p-1 bg-gradient-to-t from-black/50 to-transparent">
                        {images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveImageIndex({ ...activeImageIndex, [product.id]: i })}
                            className={`w-2 h-2 rounded-full transition-all ${
                              i === currentImgIdx ? 'bg-white scale-125' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-5 space-y-2">
                    <h3 className="font-bold text-slate-800 text-sm line-clamp-1 group-hover:text-emerald-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {product.desc || '精选优质好物，白狐官方品质保障。'}
                    </p>

                    <div className="pt-2 flex items-baseline space-x-2">
                      <span className="text-lg font-extrabold text-emerald-600">
                        ¥{product.price}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-xs text-slate-400 line-through">
                          ¥{product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                  {isAdmin && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEdit(product)}
                        className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold"
                        title="编辑商品"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-semibold"
                        title="下架商品"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setChatProduct(product);
                      setIsChatOpen(true);
                    }}
                    className="py-2 px-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                    title="咨询在线客服"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>咨询</span>
                  </button>

                  <button
                    onClick={() => handleOpenBuyModal(product)}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center space-x-1 shadow-xs transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>立即选购 / 下单</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: Orders List (Admin View) */}
      {isAdmin && activeTab === 'orders' && (
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-emerald-600" />
                <span>客户订单处理中心 (共 {orders?.length || 0} 笔)</span>
              </h3>
              <p className="text-xs text-slate-400">查看客户提交的收货地址、手机、邮箱与支付偏好，精准分类筛选与更新状态</p>
            </div>

            {/* 订单状态筛选器：全部 / 已支付 / 未支付 */}
            <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setOrderFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  orderFilter === 'all' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                全部订单 ({orders?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setOrderFilter('paid')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center space-x-1 ${
                  orderFilter === 'paid' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>已支付 ({orders?.filter(o => o.status === 'paid' || o.status === 'completed' || o.status === 'shipped').length || 0})</span>
              </button>
              <button
                type="button"
                onClick={() => setOrderFilter('unpaid')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center space-x-1 ${
                  orderFilter === 'unpaid' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>未支付 ({orders?.filter(o => o.status === 'pending' || o.status === 'unpaid').length || 0})</span>
              </button>
            </div>
          </div>

          {orders && orders.filter(o => {
            if (orderFilter === 'paid') return o.status === 'paid' || o.status === 'completed' || o.status === 'shipped';
            if (orderFilter === 'unpaid') return o.status === 'pending' || o.status === 'unpaid';
            return true;
          }).length > 0 ? (
            <div className="divide-y divide-slate-100">
              {orders.filter(o => {
                if (orderFilter === 'paid') return o.status === 'paid' || o.status === 'completed' || o.status === 'shipped';
                if (orderFilter === 'unpaid') return o.status === 'pending' || o.status === 'unpaid';
                return true;
              }).map((order) => (
                <div key={order.id} className="py-4 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      {order.productImage && (
                        <img src={order.productImage} alt={order.productName} className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-slate-800 text-xs">{order.productName}</h4>
                          <span className="text-[10px] font-mono text-slate-400">单号: {order.id}</span>
                        </div>
                        <p className="text-xs text-slate-500">
                          数量: <strong>{order.quantity}</strong> · 总额: <strong className="text-emerald-600 font-bold">¥{order.totalAmount}</strong> · 支付偏好: {order.paymentMethod}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className="px-2.5 py-1 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                      >
                        <option value="pending">待付款 / 确认中</option>
                        <option value="paid">已支付 / 待发货</option>
                        <option value="shipped">已发货</option>
                        <option value="completed">已完成</option>
                      </select>
                    </div>
                  </div>

                  {/* Customer Contact & Address Block */}
                  <div className="bg-slate-50 p-3 rounded-2xl text-[11px] text-slate-600 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    <div className="flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>收件人: <strong>{order.customerName}</strong></span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>手机: <strong>{order.phone}</strong></span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>邮箱: <strong>{order.email}</strong></span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate" title={order.address}>地址: <strong>{order.address}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              暂无订单记录，发布精美商品吸引访客下单吧！
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Customer Inquiries / Online Chat (Admin View) */}
      {isAdmin && activeTab === 'inquiries' && (
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>商城在线客服咨询中心</span>
              </h3>
              <p className="text-xs text-slate-400">实时接收访客对商品的咨询问题，支持直接在后台回复访客</p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('确认清空所有咨询记录吗？')) {
                  setChatMessages([]);
                  localStorage.removeItem('wf_shop_chat_messages');
                  showToast('已清空咨询记录');
                }
              }}
              className="text-xs text-rose-500 hover:text-rose-700 cursor-pointer"
            >
              清空记录
            </button>
          </div>

          <div className="space-y-3 max-h-[350px] overflow-y-auto p-3 bg-slate-50/70 rounded-2xl">
            {chatMessages && chatMessages.length > 0 ? (
              chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-2xl max-w-[80%] ${
                    msg.role === 'admin'
                      ? 'ml-auto bg-emerald-600 text-white'
                      : 'mr-auto bg-white border border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 mb-1">
                    <span>{msg.sender} {msg.productTitle ? `(关于: ${msg.productTitle})` : ''}</span>
                    <span>{msg.time}</span>
                  </div>
                  <p className="text-xs whitespace-pre-wrap">{msg.text}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-slate-400 py-6">暂无客户咨询消息</p>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="以站长/客服身份回复访客..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 flex items-center gap-1 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>回复</span>
            </button>
          </form>
        </div>
      )}

      {/* Floating Chat Trigger Button for Visitors */}
      <div className="fixed bottom-6 left-6 z-40">
        <button
          onClick={() => {
            setChatProduct(null);
            setIsChatOpen(true);
          }}
          className="px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl flex items-center space-x-2 text-xs font-bold cursor-pointer transition-transform hover:scale-105"
        >
          <MessageCircle className="w-4 h-4" />
          <span>联系在线客服</span>
        </button>
      </div>

      {/* Online Customer Service Chat Modal (Visitor & General) */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[520px] animate-scaleUp">
            {/* Header */}
            <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <div>
                  <h4 className="font-bold text-xs">白狐商城在线客服</h4>
                  <p className="text-[10px] text-emerald-100">站长随时在线 · 极速解答</p>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-white/80 hover:text-white text-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product context banner if available */}
            {chatProduct && (
              <div className="p-2.5 bg-emerald-50 border-b border-emerald-100 flex items-center space-x-2 text-xs">
                <img
                  src={chatProduct.images?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80'}
                  alt={chatProduct.name}
                  className="w-8 h-8 rounded-lg object-cover"
                />
                <span className="font-bold text-emerald-900 truncate">咨询商品: {chatProduct.name}</span>
              </div>
            )}

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-2xl max-w-[85%] text-xs ${
                    msg.role === 'admin'
                      ? 'mr-auto bg-white border border-slate-200 text-slate-800'
                      : 'ml-auto bg-emerald-600 text-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 mb-1">
                    <span>{msg.role === 'admin' ? '商城客服 / 站长' : msg.sender}</span>
                    <span>{msg.time}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="请输入您的问题或要求..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>发送</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: Payment Settings (Admin Only) */}
      {isAdmin && activeTab === 'payment-settings' && (
        <form onSubmit={handleSavePaymentSettings} className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>预留主流支付接口与收单配置 (仅管理员可见)</span>
              </h3>
              <p className="text-xs text-slate-400">
                配置 PayPal 跨境收单、万里汇 (WorldFirst)、微信支付商户号及支付宝当面付接口凭证
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
              站长专享机密
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* PayPal */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="font-bold text-blue-900 block">PayPal 国际收单网关</span>
              <div>
                <label className="block text-slate-500 font-medium mb-1">Client ID</label>
                <input
                  type="password"
                  value={paymentSettings?.paypalClientId || ''}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, paypalClientId: e.target.value })}
                  placeholder="PayPal Client ID"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-medium mb-1">Client Secret</label>
                <input
                  type="password"
                  value={paymentSettings?.paypalSecret || ''}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, paypalSecret: e.target.value })}
                  placeholder="PayPal Secret Key"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                />
              </div>
            </div>

            {/* WorldFirst 万里汇 */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="font-bold text-emerald-900 block">万里汇 (WorldFirst) 跨境账户</span>
              <div>
                <label className="block text-slate-500 font-medium mb-1">商户客户编号 (Customer ID)</label>
                <input
                  type="text"
                  value={paymentSettings?.wfCustomerId || ''}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, wfCustomerId: e.target.value })}
                  placeholder="WF-20250001"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-medium mb-1">收款银行账户 / 虚拟 IBAN</label>
                <input
                  type="password"
                  value={paymentSettings?.wfIban || ''}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, wfIban: e.target.value })}
                  placeholder="万里汇收款专属账号"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                />
              </div>
            </div>

            {/* WeChat Pay */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="font-bold text-emerald-900 block">微信支付 (WeChat Pay)</span>
              <div>
                <label className="block text-slate-500 font-medium mb-1">商户号 (MCH_ID)</label>
                <input
                  type="text"
                  value={paymentSettings?.wechatMchId || ''}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, wechatMchId: e.target.value })}
                  placeholder="1600000000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-medium mb-1">API v3 密钥</label>
                <input
                  type="password"
                  value={paymentSettings?.wechatApiV3Key || ''}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, wechatApiV3Key: e.target.value })}
                  placeholder="微信支付 API v3 Key"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                />
              </div>
            </div>

            {/* Alipay */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="font-bold text-sky-900 block">支付宝 (Alipay 开放平台)</span>
              <div>
                <label className="block text-slate-500 font-medium mb-1">应用公钥 / AppID</label>
                <input
                  type="text"
                  value={paymentSettings?.alipayAppId || ''}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, alipayAppId: e.target.value })}
                  placeholder="2021000000000000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-medium mb-1">应用私钥 (RSA2)</label>
                <input
                  type="password"
                  value={paymentSettings?.alipayPrivateKey || ''}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, alipayPrivateKey: e.target.value })}
                  placeholder="支付宝应用私钥"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              保存支付接口参数
            </button>
          </div>
        </form>
      )}

      {/* MODAL 1: Create or Edit Product */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>{editingProduct ? '编辑商品信息' : '发布全新在售商品'}</span>
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">商品标题 / 显式名称</label>
                <input
                  type="text"
                  required
                  placeholder="例如: 白狐限量款陶瓷保温杯"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">分类</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">库存数量</label>
                  <input
                    type="number"
                    min="1"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">现价 (元)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">原价 (元，可划线显示)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">商品描述与规格说明</label>
                <textarea
                  rows={3}
                  value={productForm.desc}
                  onChange={(e) => setProductForm({ ...productForm, desc: e.target.value })}
                  placeholder="材质、尺寸、发货须知等完整描述..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              {/* Multi-Image Upload Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-600 font-bold">
                    商品图册 (多图支持，首张为主图)
                  </label>
                  <label className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-bold cursor-pointer flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>添加图片</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex flex-wrap gap-2 p-2 bg-slate-50 rounded-2xl min-h-[70px] items-center">
                  {productForm.images && productForm.images.length > 0 ? (
                    productForm.images.map((img, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 group">
                        <img src={img} alt="preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImageFromForm(i)}
                          className="absolute top-1 right-1 p-0.5 bg-rose-600 text-white rounded-full opacity-80 hover:opacity-100"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <span className="text-[11px] text-slate-400 mx-auto">尚未添加图片，将使用默认精选配图</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  {editingProduct ? '确认保存更新' : '立即发布上架'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Buy & Order Placement */}
      {purchasingProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>填写收货信息与选购提交</span>
              </h3>
              <button
                onClick={() => setPurchasingProduct(null)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Product summary card */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center space-x-3">
              <img
                src={purchasingProduct.images?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80'}
                alt={purchasingProduct.name}
                className="w-14 h-14 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-800 text-xs truncate">{purchasingProduct.name}</h4>
                <p className="text-xs text-emerald-700 font-extrabold mt-0.5">单价: ¥{purchasingProduct.price}</p>
              </div>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-3 text-xs">
              {/* Quantity selector */}
              <div>
                <label className="block text-slate-600 font-bold mb-1">选购数量</label>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                    className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-sm">{orderQuantity}</span>
                  <button
                    type="button"
                    onClick={() => setOrderQuantity(orderQuantity + 1)}
                    className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  >
                    +
                  </button>
                  <span className="text-slate-400 text-[11px] ml-auto">
                    总计金额: <strong className="text-emerald-600 text-sm">¥{(purchasingProduct.price * orderQuantity).toFixed(2)}</strong>
                  </span>
                </div>
              </div>

              {/* Required Contact Info: Address, Phone, Email */}
              <div>
                <label className="block text-slate-600 font-bold mb-1">
                  收件人姓名 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="张三"
                  value={orderForm.customerName}
                  onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">
                    联系电话 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="13800000000"
                    value={orderForm.phone}
                    onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">
                    通知邮箱 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={orderForm.email}
                    onChange={(e) => setOrderForm({ ...orderForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">
                  详细收货地址 (省市区街道门牌号) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="例如: 广东省深圳市南山区高新南九道科技园..."
                  value={orderForm.address}
                  onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">支付偏好</label>
                <select
                  value={orderForm.paymentMethod}
                  onChange={(e) => setOrderForm({ ...orderForm, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="wechat">微信支付 (WeChat Pay)</option>
                  <option value="alipay">支付宝 (Alipay)</option>
                  <option value="paypal">PayPal 国际收单</option>
                  <option value="worldfirst">万里汇 (WorldFirst)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">订单备注 (选填)</label>
                <input
                  type="text"
                  placeholder="特殊发货要求或颜色款式偏好..."
                  value={orderForm.notes}
                  onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPurchasingProduct(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow-xs"
                >
                  确认提交订单 (¥{(purchasingProduct.price * orderQuantity).toFixed(2)})
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
