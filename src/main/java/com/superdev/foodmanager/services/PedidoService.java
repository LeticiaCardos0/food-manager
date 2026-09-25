package com.superdev.foodmanager.services;

import com.superdev.foodmanager.dtos.pedido.PedidoAtualizarDto;
import com.superdev.foodmanager.dtos.pedido.PedidoCriarDto;
import com.superdev.foodmanager.models.Pedido;
import com.superdev.foodmanager.repositories.PedidoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class PedidoService {
    private final PedidoRepository repository;

    public PedidoService(PedidoRepository repository) {
        this.repository = repository;
    }

    public List<Pedido> listar(){
        return this.repository.findAll();
    }

    public Pedido criar(PedidoCriarDto dado){
        var pedido = Pedido.builder()
                .nomeCliente(dado.nomeCliente())
                .data(dado.data())
                .valorTotal(dado.valorTotal())
                .formaPagamento(dado.formaPagamento())
                .observacao(dado.observacao())
                .tipoPedido(dado.tipoPedido())
                .tempoEstimado(dado.tempoEstimado())
                .status(dado.status())
                .build();

        return this.repository.save(pedido);
    }

    public Pedido atualizar(int id, PedidoAtualizarDto dado){
        var pedido = buscarOuFalhar(id);
        pedido.setNomeCliente(dado.nomeCliente());
        pedido.setData(dado.data());
        pedido.setValorTotal(dado.valorTotal());
        pedido.setFormaPagamento(dado.formaPagamento());
        pedido.setObservacao(dado.observacao());
        pedido.setTipoPedido(dado.tipoPedido());
        pedido.setTempoEstimado(dado.tempoEstimado());
        pedido.setStatus(dado.status());

        return repository.save(pedido);
    }
    
    public Pedido apagar(int id){
        var pedido = buscarOuFalhar(id);
        repository.delete(pedido);
        return pedido;
    }

    public Pedido obterPorId(int id){
        return buscarOuFalhar(id);
    }

    private Pedido buscarOuFalhar(int id){
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado"));
    }
}
