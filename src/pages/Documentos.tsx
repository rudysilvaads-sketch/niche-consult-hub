import { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  Receipt,
  FileCheck,
  FileWarning,
  ClipboardList,
  Pill
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/contexts/AppContext';
import { Document, DOCUMENT_TYPE_LABELS, DocumentType } from '@/types';
import { toast } from 'sonner';
import { DocumentFormDialog } from '@/components/documents/DocumentFormDialog';
import { DocumentViewDialog } from '@/components/documents/DocumentViewDialog';
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

const Documentos = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<DocumentType | 'todos'>('todos');
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>('recibo');

  const { documents, patients, addDocument, updateDocument, deleteDocument } = useApp();

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'todos' || doc.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const getDocumentIcon = (type: DocumentType) => {
    switch (type) {
      case 'recibo': return Receipt;
      case 'atestado': return FileCheck;
      case 'declaracao': return FileWarning;
      case 'relatorio': return ClipboardList;
      case 'receituario': return Pill;
      default: return FileText;
    }
  };

  const getDocumentColor = (type: DocumentType) => {
    switch (type) {
      case 'recibo': return 'bg-success/10 text-success';
      case 'atestado': return 'bg-primary/10 text-primary';
      case 'declaracao': return 'bg-warning/10 text-warning';
      case 'relatorio': return 'bg-accent/10 text-accent';
      case 'receituario': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleNewDocument = (type: DocumentType) => {
    setSelectedDocument(null);
    setDocumentType(type);
    setDocumentDialogOpen(true);
  };

  const handleEditDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setDocumentType(doc.type);
    setDocumentDialogOpen(true);
  };

  const handleViewDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setViewDialogOpen(true);
  };

  const handleDeleteClick = (doc: Document) => {
    setSelectedDocument(doc);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedDocument) {
      deleteDocument(selectedDocument.id);
      toast.success('Documento excluído com sucesso!');
      setDeleteDialogOpen(false);
      setSelectedDocument(null);
    }
  };

  const handleSaveDocument = (doc: Partial<Document>) => {
    if (selectedDocument) {
      updateDocument(selectedDocument.id, doc);
      toast.success('Documento atualizado com sucesso!');
    } else {
      addDocument(doc);
      toast.success('Documento criado com sucesso!');
    }
  };

  const documentCounts = {
    todos: documents.length,
    recibo: documents.filter(d => d.type === 'recibo').length,
    atestado: documents.filter(d => d.type === 'atestado').length,
    declaracao: documents.filter(d => d.type === 'declaracao').length,
    relatorio: documents.filter(d => d.type === 'relatorio').length,
    receituario: documents.filter(d => d.type === 'receituario').length,
  };

  return (
    <MainLayout>
      <Header 
        title="Documentos" 
        subtitle="Geração de recibos, atestados, declarações e relatórios"
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4 mb-6 sm:mb-8">
        <Button 
          variant="outline" 
          className="h-auto p-3 sm:p-4 flex flex-col items-center gap-1 sm:gap-2 hover:border-success hover:bg-success/5"
          onClick={() => handleNewDocument('recibo')}
        >
          <Receipt className="h-5 w-5 sm:h-6 sm:w-6 text-success" />
          <span className="text-xs sm:text-sm font-medium">Recibo</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-auto p-3 sm:p-4 flex flex-col items-center gap-1 sm:gap-2 hover:border-primary hover:bg-primary/5"
          onClick={() => handleNewDocument('atestado')}
        >
          <FileCheck className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <span className="text-xs sm:text-sm font-medium">Atestado</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-auto p-3 sm:p-4 flex flex-col items-center gap-1 sm:gap-2 hover:border-warning hover:bg-warning/5"
          onClick={() => handleNewDocument('declaracao')}
        >
          <FileWarning className="h-5 w-5 sm:h-6 sm:w-6 text-warning" />
          <span className="text-xs sm:text-sm font-medium truncate">Declaração</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-auto p-3 sm:p-4 flex flex-col items-center gap-1 sm:gap-2 hover:border-accent hover:bg-accent/5 hidden sm:flex"
          onClick={() => handleNewDocument('relatorio')}
        >
          <ClipboardList className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
          <span className="text-xs sm:text-sm font-medium">Relatório</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-auto p-3 sm:p-4 flex flex-col items-center gap-1 sm:gap-2 hover:border-destructive hover:bg-destructive/5 hidden sm:flex"
          onClick={() => handleNewDocument('receituario')}
        >
          <Pill className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
          <span className="text-xs sm:text-sm font-medium">Receituário</span>
        </Button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col gap-4 mb-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="bg-muted/50 w-full sm:w-auto grid grid-cols-4 sm:flex h-auto">
            <TabsTrigger value="todos" className="text-xs sm:text-sm py-2">Todos</TabsTrigger>
            <TabsTrigger value="recibo" className="text-xs sm:text-sm py-2">Recibos</TabsTrigger>
            <TabsTrigger value="atestado" className="text-xs sm:text-sm py-2">Atestados</TabsTrigger>
            <TabsTrigger value="declaracao" className="text-xs sm:text-sm py-2 hidden sm:flex">Declarações</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 input-styled"
          />
        </div>
      </div>

      {/* Documents List */}
      <div className="card-elevated">
        <div className="divide-y divide-border">
          {filteredDocuments.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Nenhum documento encontrado</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">Use os botões acima para criar um novo documento.</p>
            </div>
          ) : (
            filteredDocuments.map((doc) => {
              const Icon = getDocumentIcon(doc.type);
              return (
                <div key={doc.id} className="p-3 sm:p-4 hover:bg-muted/30 transition-colors animate-slide-up">
                  <div className="flex items-start sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                      <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-lg flex items-center justify-center flex-shrink-0 ${getDocumentColor(doc.type)}`}>
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-foreground text-sm sm:text-base truncate">{doc.title}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {doc.patientName} • {new Date(doc.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      <span className={`badge-status text-xs hidden sm:inline-flex ${getDocumentColor(doc.type)}`}>
                        {DOCUMENT_TYPE_LABELS[doc.type]}
                      </span>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewDocument(doc)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:flex" onClick={() => handleEditDocument(doc)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:flex" onClick={() => toast.success('Download iniciado!')}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hidden sm:flex" onClick={() => handleDeleteClick(doc)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Dialogs */}
      <DocumentFormDialog
        open={documentDialogOpen}
        onOpenChange={setDocumentDialogOpen}
        onSave={handleSaveDocument}
        document={selectedDocument}
        type={documentType}
        patients={patients}
      />

      <DocumentViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        document={selectedDocument}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.
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

export default Documentos;
