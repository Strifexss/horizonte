import React, { useEffect, useRef, useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MoneyInput, { parseMoneyValue } from '@/components/ui/money-input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AsyncSelect from '@/components/ui/AsyncSelect';
import ProdutosModal from '@/components/produtos/ProdutosModal';
import FuncionariosModal from '@/components/funcionarios/FuncionariosModal';
import FornecedoresModal from '@/components/fornecedores/FornecedoresModal';
import GruposModal from '@/components/grupos/GruposModal';
