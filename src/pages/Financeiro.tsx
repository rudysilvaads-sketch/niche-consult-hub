import { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Filter, 
  Search,
  ArrowUpCircle,
  ArrowDownCircle,
  CreditCard,
  Receipt,
  Package,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/contexts/AppContext';
import { Transaction, PAYMENT_STATUS_LABELS, PAYMENT_METHOD_LABELS, TRANSACTION_CATEGORY_LABELS } from '@/types';
import { toast } from 'sonner';
import { TransactionFormDialog } from '@/components/financial/TransactionFormDialog';
import { PackageFormDialog } from '@/components/financial/PackageFormDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const Financeiro = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('transacoes');
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [packageDialogOpen, setPackageDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [transactionType, setTransactionType] = useState<'receita' | 'despesa'>('receita');

  const { 
    transactions, 
    packages, 
    patients,
    stats,
    addTransaction, 
    updateTransaction, 
    deleteTransaction,
    addPackage,
    updatePackage,
    deletePackage 
  } = useApp();

  const filteredTransactions = transactions.filter((t) =>
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.patientName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const receitas = filteredTransactions.filter(t => t.type === 'receita');
  const despesas = filteredTransactions.filter(t => t.type === 'despesa');

  const handleNewReceita = () => {
    setSelectedTransaction(null);
    setTransactionType('receita');
    setTransactionDialogOpen(true);
  };

  const handleNewDespesa = () => {
    setSelectedTransaction(null);
    setTransactionType('despesa');
    setTransactionDialogOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setTransactionType(transaction.type);
    setTransactionDialogOpen(true);
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedTransaction) {
      deleteTransaction(selectedTransaction.id);
      toast.success('Transação excluída com sucesso!');
      setDeleteDialogOpen(false);
      setSelectedTransaction(null);
    }
  };

  const handleSaveTransaction = (transaction: Partial<Transaction>) => {
    if (selectedTransaction) {
      updateTransaction(selectedTransaction.id, transaction);
      toast.success('Transação atualizada com sucesso!');
    } else {
      addTransaction(transaction);
      toast.success('Transação registrada com sucesso!');
    }
  };

  const handleNewPackage = () => {
    setSelectedPackage(null);
    setPackageDialogOpen(true);
  };

  const handleEditPackage = (pkg: any) => {
    setSelectedPackage(pkg);
    setPackageDialogOpen(true);
  };

  const handleSavePackage = (pkg: any) => {
    if (selectedPackage) {
      updatePackage(selectedPackage.id, pkg);
      toast.success('Pacote atualizado com sucesso!');
    } else {
      addPackage(pkg);
      toast.success('Pacote criado com sucesso!');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-success/10 text-success';
      case 'pendente': return 'bg-warning/10 text-warning';
      case 'parcial': return 'bg-accent/10 text-accent';
      case 'cancelado': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <MainLayout>
      <Header 
        title="Financeiro" 
        subtitle="Gestão de receitas, despesas e pacotes"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Receitas do Mês</p>
              <p className="text-2xl font-bold text-success mt-1">{formatCurrency(stats.monthRevenue)}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
          </div>
        </div>

        <div className="card-elevated p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Despesas do Mês</p>
              <p className="text-2xl font-bold text-destructive mt-1">{formatCurrency(stats.monthExpenses)}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-destructive" />
            </div>
          </div>
        </div>

        <div className="card-elevated p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Lucro do Mês</p>
              <p className="text-2xl font-bold text-primary mt-1">{formatCurrency(stats.monthRevenue - stats.monthExpenses)}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="card-elevated p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pagamentos Pendentes</p>
              <p className="text-2xl font-bold text-warning mt-1">{formatCurrency(stats.pendingPayments)}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-warning" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="transacoes" className="gap-2">
              <Receipt className="h-4 w-4" />
              Transações
            </TabsTrigger>
            <TabsTrigger value="pacotes" className="gap-2">
              <Package className="h-4 w-4" />
              Pacotes
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3">
            {activeTab === 'transacoes' && (
              <>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar transação..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 input-styled"
                  />
                </div>
                <Button onClick={handleNewReceita} className="bg-success hover:bg-success/90 gap-2">
                  <ArrowUpCircle className="h-4 w-4" />
                  Receita
                </Button>
                <Button onClick={handleNewDespesa} variant="destructive" className="gap-2">
                  <ArrowDownCircle className="h-4 w-4" />
                  Despesa
                </Button>
              </>
            )}
            {activeTab === 'pacotes' && (
              <Button onClick={handleNewPackage} className="btn-gradient gap-2">
                <Plus className="h-4 w-4" />
                Novo Pacote
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="transacoes" className="space-y-4">
          {/* Receitas */}
          <div className="card-elevated">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <ArrowUpCircle className="h-5 w-5 text-success" />
                Receitas ({receitas.length})
              </h3>
            </div>
            <div className="divide-y divide-border">
              {receitas.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  Nenhuma receita encontrada
                </div>
              ) : (
                receitas.map((transaction) => (
                  <div key={transaction.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                        <ArrowUpCircle className="h-5 w-5 text-success" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString('pt-BR')} • {TRANSACTION_CATEGORY_LABELS[transaction.category]}
                          {transaction.paymentMethod && ` • ${PAYMENT_METHOD_LABELS[transaction.paymentMethod]}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`badge-status ${getStatusColor(transaction.status)}`}>
                        {PAYMENT_STATUS_LABELS[transaction.status]}
                      </span>
                      <span className="font-bold text-success">{formatCurrency(transaction.value)}</span>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditTransaction(transaction)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteTransaction(transaction)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Despesas */}
          <div className="card-elevated">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <ArrowDownCircle className="h-5 w-5 text-destructive" />
                Despesas ({despesas.length})
              </h3>
            </div>
            <div className="divide-y divide-border">
              {despesas.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  Nenhuma despesa encontrada
                </div>
              ) : (
                despesas.map((transaction) => (
                  <div key={transaction.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                        <ArrowDownCircle className="h-5 w-5 text-destructive" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString('pt-BR')} • {TRANSACTION_CATEGORY_LABELS[transaction.category]}
                          {transaction.paymentMethod && ` • ${PAYMENT_METHOD_LABELS[transaction.paymentMethod]}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`badge-status ${getStatusColor(transaction.status)}`}>
                        {PAYMENT_STATUS_LABELS[transaction.status]}
                      </span>
                      <span className="font-bold text-destructive">-{formatCurrency(transaction.value)}</span>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditTransaction(transaction)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteTransaction(transaction)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pacotes" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div key={pkg.id} className="card-elevated p-6 animate-slide-up">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <span className={`badge-status ${pkg.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                    {pkg.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">{pkg.name}</h3>
                {pkg.description && (
                  <p className="text-sm text-muted-foreground mb-4">{pkg.description}</p>
                )}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sessões</span>
                    <span className="font-medium text-foreground">{pkg.sessions}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Validade</span>
                    <span className="font-medium text-foreground">{pkg.validity} dias</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Valor por sessão</span>
                    <span className="font-medium text-foreground">{formatCurrency(pkg.value / pkg.sessions)}</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary">{formatCurrency(pkg.value)}</span>
                    <Button variant="outline" size="sm" onClick={() => handleEditPackage(pkg)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <TransactionFormDialog
        open={transactionDialogOpen}
        onOpenChange={setTransactionDialogOpen}
        onSave={handleSaveTransaction}
        transaction={selectedTransaction}
        type={transactionType}
        patients={patients}
      />

      <PackageFormDialog
        open={packageDialogOpen}
        onOpenChange={setPackageDialogOpen}
        onSave={handleSavePackage}
        pkg={selectedPackage}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default Financeiro;
