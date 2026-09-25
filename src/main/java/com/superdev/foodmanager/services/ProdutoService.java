package com.superdev.foodmanager.services;

import com.superdev.foodmanager.dtos.produto.ProdutoAtualizarDto;
import com.superdev.foodmanager.dtos.produto.ProdutoCriarDto;
import com.superdev.foodmanager.models.Produto;
import com.superdev.foodmanager.repositories.ProdutoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
@Service
public class ProdutoService {

    private final ProdutoRepository repository;

    public ProdutoService(ProdutoRepository repository) {
        this.repository = repository;
    }

    public List<Produto> listar(){
        return this.repository.findAll();
    }

    public Produto criar(ProdutoCriarDto dado){
        var produto = Produto.builder()
                .nome(dado.nome())
                .preco(dado.preco())
                .descricao(dado.descricao())
                .tempoPreparo(dado.tempoPreparo())
                .build();

        return this.repository.save(produto);
    }

    public Produto atualizar(int id, ProdutoAtualizarDto dado){
        var produto = buscarOuFalhar(id);
        produto.setNome(dado.nome());
        produto.setPreco(dado.preco());
        produto.setDescricao(dado.descricao());
        produto.setTempoPreparo(dado.tempoPreparo());

        return repository.save(produto);
    }

    public Produto apagar(int id){
        var produto = buscarOuFalhar(id);
        repository.delete(produto);
        return produto;
    }

    public Produto obterPorId(int id){
        return buscarOuFalhar(id);
    }

    private Produto buscarOuFalhar(int id){
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado"));
    }
}
