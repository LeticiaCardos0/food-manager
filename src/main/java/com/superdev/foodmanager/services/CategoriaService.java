package com.superdev.foodmanager.services;


import com.superdev.foodmanager.dtos.categoria.CategoriaAtualizarDto;
import com.superdev.foodmanager.dtos.categoria.CategoriaCriarDto;
import com.superdev.foodmanager.models.Categoria;
import com.superdev.foodmanager.repositories.CategoriaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CategoriaService {
    private final CategoriaRepository repository;

    public CategoriaService(CategoriaRepository repository) {
        this.repository = repository;
    }

    public List<Categoria> listar(){
        return this.repository.findAll();
    }
    public Categoria criar(CategoriaCriarDto dado){
        var categoria = Categoria.builder()
                .nome(dado.nome())
                .descricao(dado.descricao())
                .build();

        return this.repository.save(categoria);
    }

    public Categoria atualizar(int id, CategoriaAtualizarDto dado){
        var categoria = repository.findById(id)
                .orElseThrow();
            categoria.setNome(dado.nome());
            categoria.setDescricao(dado.descricao());

        return repository.save(categoria);
    }

    public Categoria apagar(int id){
        var categoria = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria não encontrada"));

        repository.delete(categoria);
        return categoria;
    }
    public Categoria obterPorId(int id){
        var categoria = repository.findById(id).orElseThrow();

        return categoria;
    }
}
